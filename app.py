from flask import Flask, render_template, url_for
from forms import RegistrationForm, LoginForm
app = Flask(__name__)

app.config['SECRET_KEY'] = '643e449d5787be04d70700f8e3625070'


@app.route("/")
def template_test():
    return render_template('layout.html', title='Home')


@app.route("/login")
def login():
    form = LoginForm()
    return render_template('login.html', title='Login', form=form)


@app.route("/register")
def register():
    form = RegistrationForm()
    return render_template("register.html", title='Register', form=form)


@app.route("/profile")
def profile():
    return render_template("profile.html", title='Profile')


@app.route("/about")
def about():
    return render_template("about.html", title='About')

if __name__ == '__main__':
    app.run(debug=True)