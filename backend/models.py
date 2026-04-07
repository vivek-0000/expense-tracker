from sqlalchemy import Column, Integer, String, ForeignKey
from database import Base
from routes import auth




class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True)
    password = Column(String)

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    amount = Column(Integer)
    category = Column(String)
    date = Column(String)
    user_id = Column(Integer, ForeignKey("users.id")) 

class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    month = Column(String, unique=True)
    amount = Column(Integer)