FROM python:3.8

RUN curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py | python
ENV PATH = "${PATH}:/root/.poetry/bin"

WORKDIR /code
COPY . /code/

RUN $HOME/.poetry/bin/poetry --version
RUN poetry config virtualenvs.create false
RUN poetry install

COPY . /code/