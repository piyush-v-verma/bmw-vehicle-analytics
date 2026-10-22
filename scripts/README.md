# BMW Image Pipeline Scripts

This folder contains the automated scripts for maintaining the verified vehicle imagery catalog:

- **`master_url_mapping.cjs`**: Authoritative mapping of all 101 BMW vehicle generation IDs to Wikimedia Commons and Wikipedia vehicle lead image assets, including verified sources and licensing information.
- **`apply_all_images.cjs`**: Automated downloader and validator that queries the Wikimedia Commons API for dynamically authorized high-resolution thumbnails, saves them locally to `public/images/bmw/` and `dist/images/bmw/`, and refreshes the manifest at `dataset/bmw_images.csv`.
