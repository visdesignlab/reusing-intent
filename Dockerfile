FROM python:3.7

RUN curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/master/install-poetry.py | python -
ENV PATH=${PATH}:/root/.local/bin

RUN poetry --version

WORKDIR /code

COPY ./reapply-workflows/pyproject.toml /code/reapply-workflows/
COPY ./reapply-workflows/poetry.lock /code/reapply-workflows/

COPY ./server/pyproject.toml /code/server/
COPY ./server/poetry.lock /code/server/

RUN cd reapply-workflows && poetry install && poetry update
COPY ./reapply-workflows/ /code/reapply-workflows/
RUN cd server && poetry install && poetry update

COPY . /code/
