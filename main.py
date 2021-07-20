from webapp import create_app
import os, sys
from flask import Flask, jsonify
from flask_cors import CORS, cross_origin


app = create_app()
CORS(app, supports_credentials=True)
def login():
    return jsonify({'success': 'ok'})

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8000, debug=True)
    


def isUserAdmin():
    """@return: True if the current user is an 'Admin' whatever that
    means (root on Unix), otherwise False.
    Warning: The inner function fails unless you have Windows XP SP2 or
    higher. The failure causes a traceback to be printed and this
    function to return False.
    """
    
    if os.name == 'nt':
        import ctypes
        # WARNING: requires Windows XP SP2 or higher!
        try:
            return ctypes.windll.shell32.IsUserAnAdmin()
        except:
            traceback.print_exc()
            print ("Admin check failed, assuming not an admin.")
            return False
    else:
        # Check for root on Posix
        return os.getuid() == 0

def runAsAdmin(cmdLine=None, wait=True):
    """Attempt to relaunch the current script as an admin using the same
    command line parameters.  Pass cmdLine in to override and set a new
    command.  It must be a list of [command, arg1, arg2...] format.
    Set wait to False to avoid waiting for the sub-process to finish. You
    will not be able to fetch the exit code of the process if wait is
    False.
    Returns the sub-process return code, unless wait is False in which
    case it returns None.
    @WARNING: this function only works on Windows.
    """

    if os.name != 'nt':
        raise RuntimeError
    
    import win32api, win32con, win32event, win32process
    from win32com.shell.shell import ShellExecuteEx
    from win32com.shell import shellcon
    
    python_exe = sys.executable

    if cmdLine is None:
        cmdLine = [python_exe] + sys.argv
    elif type(cmdLine) not in (types.TupleType,types.ListType):
        raise ValueError
    cmd = '"%s"' % (cmdLine[0],)
    # XXX TODO: isn't there a function or something we can call to massage command line params?
    params = " ".join(['"%s"' % (x,) for x in cmdLine[1:]])
    cmdDir = ''
    showCmd = win32con.SW_SHOWNORMAL
    lpVerb = 'runas'  # causes UAC elevation prompt.
    
    # print "Running", cmd, params

    # ShellExecute() doesn't seem to allow us to fetch the PID or handle
    # of the process, so we can't get anything useful from it. Therefore
    # the more complex ShellExecuteEx() must be used.

    # procHandle = win32api.ShellExecute(0, lpVerb, cmd, params, cmdDir, showCmd)

    procInfo = ShellExecuteEx(nShow=showCmd,
                              fMask=shellcon.SEE_MASK_NOCLOSEPROCESS,
                              lpVerb=lpVerb,
                              lpFile=cmd,
                              lpParameters=params)

    if wait:
        procHandle = procInfo['hProcess']    
        obj = win32event.WaitForSingleObject(procHandle, win32event.INFINITE)
        rc = win32process.GetExitCodeProcess(procHandle)
        #print "Process handle %s returned code %s" % (procHandle, rc)
    else:
        rc = None

    return rc

def test():
    """A simple test function; check if we're admin, and if not relaunch
    the script as admin.""",
    rc = 0
    if not isUserAdmin():
        print ("You're not an admin.", os.getpid(), "params: ", sys.argv)
        #rc = runAsAdmin(["c:\\Windows\\notepad.exe"])
        rc = runAsAdmin()
    else:
        print ("You are an admin!", os.getpid(), "params: ", sys.argv)
        rc = 0
    x = raw_input('Press Enter to exit.')
    return rc


if __name__ == '__main__':
    app.run(host=os.getenv("IP", "0.0.0.0"),
            port=int(os.getenv("PORT", "5000")),
            debug=True)
