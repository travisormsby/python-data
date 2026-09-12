These are the materials for the "Python Data Therapy" workshop taught at the MN GIS/LIS Consortium Fall 2026 Workshops.

The repository consists of two distinct parts:

- A Jupyter notebook, data, and supporting configuration files to build a local Python environment for running the notebook.
- The source code for a web app of [Parsons problems](https://en.wikipedia.org/wiki/Parsons_problem) related to the concepts discussed in the Jupyter notebook. A live version of the app built from this code is available at https://projects.travisormsby.com/python-data

To get started:

1. Verify that [uv is installed](https://docs.astral.sh/uv/getting-started/installation/)
1. Clone this repository locally
1. From the `notebook` directory:
    1. Create the Python environment: `uv sync`
    1. Start the Jupyter notebook server: `uv run jupyter notebook`
1. Open `data_therapy.ipynb`

Data credits:

- `mn_counties.csv` and parquet files derived from this file were sourced from data from [Wikipedia](https://en.wikipedia.org/wiki/List_of_counties_in_Minnesota).
- `child_care.gpkg` was sourced from the [Minnesota Geospatial Commons](https://www.arcgis.com/home/item.html?id=2396668679a640788852c916fdae6045#overview), from data collected by the Minnesota Department of Human Services (DHS). The use of this data is conditioned on acceptance of the DHS terms and conditions outlined at https://licensinglookup.dhs.state.mn.us/Disclaimer.aspx.
