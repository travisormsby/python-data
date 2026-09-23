These are the materials for the "Python Data Therapy" workshop taught at the MN GIS/LIS Consortium Fall 2026 Workshops.

The repository consists of two distinct parts:

- A Jupyter notebook, data, and supporting configuration files to build a local Python environment for running the notebook.
- The source code for a web app of [Parsons problems](https://en.wikipedia.org/wiki/Parsons_problem) related to the concepts discussed in the Jupyter notebook. A live version of the app built from this code is available at https://projects.travisormsby.com/python-data

## Open notebook in Google Colab

If you have a Google account, the easiest way to open the notebook is in Colab:

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/travisormsby/python-data/blob/main/notebook/data_therapy.ipynb)

You will need to run the setup cell to get the notebook set up to run correctly.

## Open notebook in GitHub Codespaces

If you are logged in to a GitHub account, you can open the notebook in a GitHub Codespaces environment:

1. In this GitHub repository, click the **Code** dropdown, then click the **Codespaces** tab.
1. Click **Create codespace on main**.
1. If you are prompted to trust the authors of the files in this folder, click **Trust Folder & Continue**.
1. When the terminal at the bottom of the screen is ready, install `uv` by running this command: `curl -LsSf https://astral.sh/uv/install.sh | sh` (use ctrl+shift+v to paste into the terminal)
1. Change to the notebook directory by running this command: `cd notebook`
1. Create the Python environment by running this command: `uv sync` (You will see a "Failed to hardlink files" warning, which is expected in the codespace environment)
1. Install the graphviz library by running this command: `sudo apt update && sudo apt install graphviz -y`
1. Open `data-therapy.ipynb`.
1. In the upper right part of the interface, click **Select Kernel**, then click **Install/Enable suggested extensions Python + Jupyter**.
1. After the extensions finish installing, if there is not a dropdown from the top prompting you to choose a kernel source, click **Select Kernel** again.
1. In the **Select Kernel** dropdown, click **Python Environments**.
1. Click the **python-data** environment (it should have a star next to it).

## Open notebook in a local environment

If you don't have either a Google or GitHub account, you'll need to open the notebook in some other environment where you can install software:

1. Verify that [uv is installed](https://docs.astral.sh/uv/getting-started/installation/) in your environment.
1. Clone this repository locally.
1. From the `notebook` directory:
    1. Create the Python environment: `uv sync`
    1. Start the Jupyter notebook server: `uv run jupyter notebook`
1. Open `data_therapy.ipynb`

## Data credits:

- `mn_counties.csv` and parquet files derived from this file were sourced from data from [Wikipedia](https://en.wikipedia.org/wiki/List_of_counties_in_Minnesota).
- `child_care.gpkg` was sourced from the [Minnesota Geospatial Commons](https://www.arcgis.com/home/item.html?id=2396668679a640788852c916fdae6045#overview), from data collected by the Minnesota Department of Human Services (DHS). The use of this data is conditioned on acceptance of the DHS terms and conditions outlined at https://licensinglookup.dhs.state.mn.us/Disclaimer.aspx.
