from flask import Flask, render_template, redirect, request, session, url_for
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField
from wtforms.validators import InputRequired, Email, Length

app = Flask(__name__)

class LoginForm(FlaskForm):
    username = StringField('username', validators=[InputRequired(), Length(min=4, max=15)])
    password = PasswordField('password', validators=[InputRequired(), Length(min=8, max=40)])
    remember = BooleanField('remember me')

@app.route("/")
def template_test():
    return render_template('template.html')


@app.route("/login")
def login():
    form = LoginForm()

    return render_template("login.html", form=form)


@app.route("/register")
def register():
    return render_template("register.html")


@app.route("/profile")
def profile():
    return render_template("profile.html")


if __name__ == '__main__':
    app.run(debug=True)