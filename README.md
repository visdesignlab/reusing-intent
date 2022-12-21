# Reusing Interactive Analysis Workflows

## Abstract

Interactive visual analysis has many advantages, but an important disadvantage is that analysis processes and workflows cannot be easily stored and reused. This is in contrast to code-based analysis workflows, which can simply be run on updated datasets, and adapted when necessary. In this paper, we introduce methods to capture workflows in interactive visualization systems for different interactions such as selections, filters, categorizing/grouping, labeling, and aggregation. These workflows can then be applied to updated datasets, making interactive visualization sessions reusable. We demonstrate this specification using an interactive visualization system that tracks interaction provenance, and allows generating workflows from the recorded actions. The system can then be used to compare different versions of datasets and apply workflows to them. Finally, we introduce a Python library that can load workflows and apply it to updated datasets directly in a computational notebook, providing a seamless bridge between computational workflows and interactive visualization tools.

For details about the work, please see the [paper page](https://vdl.sci.utah.edu/publications/2022_eurovis_reusing_workflows/).

## Citation

Kiran Gadhave, Zach Cutler, Alexander Lex  
Reusing Interactive Analysis Workflows  
Computer Graphics Forum (EuroVis), 41(3): 133–144, doi:10.1111/cgf.14528, 2022.   

BibTex
```bibtex
@article{2022_eurovis_reusing,
  title = {Reusing Interactive Analysis Workflows},
  author = {Kiran Gadhave and Zach Cutler and Alexander Lex},
  journal = {Computer Graphics Forum (EuroVis)},
  doi = {10.1111/cgf.14528},
  pages = {133–144},
  volume = {41},
  number = {3},
  year = {2022}
}
```

## Developement

NOTE: The project uses [Poetry](https://python-poetry.org/) package manager for python. You need to install poetry using your preffered way to install python packages.

Clone the repository and run the following script to setup the python environments.

```bash
yarn run install:all
```

This will install the python environment and all dependencies using poetry. You can run the flask server now:

```bash
poetry run flask run --host=0.0.0.0
```

Alternatively you can use Docker compose to do all of the steps automatically.

```bash
docker-compose up
```

In a different terminal `cd` in the `app` folder and run:

```bash
yarn install
yarn start
```

This should start the front end.
