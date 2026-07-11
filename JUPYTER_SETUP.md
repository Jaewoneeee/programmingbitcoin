# Jupyter local setup

This guide documents the local setup used for running the Programming Bitcoin notebooks in a fresh environment.

## Prerequisites

- Python 3.9 or newer
- `pip`
- Git

The original `README.md` only requires Python 3.5+, but using a currently supported Python version is safer for modern Jupyter packages.

## 1. Clone the repository

```bash
git clone https://github.com/jimmysong/programmingbitcoin
cd programmingbitcoin
```

If you already have the repository, just move into it:

```bash
cd /path/to/programmingbitcoin
```

## 2. Create a virtual environment

Create the environment inside the repository so the dependencies stay isolated from your system Python.

```bash
python3 -m venv .venv
```

Activate it:

```bash
source .venv/bin/activate
```

On Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

On Windows Command Prompt:

```bat
.venv\Scripts\activate.bat
```

## 3. Upgrade packaging tools

```bash
python -m pip install --upgrade pip setuptools wheel
```

## 4. Install notebook dependencies

Install the dependencies from the repository:

```bash
python -m pip install -r requirements.txt
```

The current `requirements.txt` contains:

```text
jupyter
requests
```

## 5. Apply compatibility adjustments

On macOS system Python 3.9, `urllib3 2.x` can warn because Apple's Python may be linked against LibreSSL instead of OpenSSL 1.1.1+. Use the latest compatible `urllib3 1.26.x` release:

```bash
python -m pip install "urllib3<2"
```

The repository's `test.py` uses the legacy `nosetests` command, so install `nose` if you want to run the provided tests:

```bash
python -m pip install nose
```

## 6. Register the Jupyter kernel

This lets Jupyter show the environment as `Python (programmingbitcoin)`.

```bash
python -m ipykernel install --user --name programmingbitcoin --display-name "Python (programmingbitcoin)"
```

Confirm that the kernel is available:

```bash
jupyter kernelspec list
```

You should see a kernel named `programmingbitcoin`.

## 7. Run Jupyter Notebook

From the repository root, with the virtual environment activated:

```bash
jupyter notebook
```

Jupyter will open a browser automatically. If it does not, copy the `http://localhost:8888/?token=...` URL from the terminal and paste it into your browser.

When opening a notebook, choose this kernel:

```text
Python (programmingbitcoin)
```

## 8. Verify the environment

Check installed package compatibility:

```bash
python -m pip check
```

Check the key package versions:

```bash
python -c "import notebook, jupyterlab, requests, urllib3, nose; print('notebook', notebook.__version__); print('jupyterlab', jupyterlab.__version__); print('requests', requests.__version__); print('urllib3', urllib3.__version__); print('nose', nose.__version__)"
```

Run the repository tests:

```bash
python test.py
```

Some later chapter tests require external network access to services such as `blockstream.info` and `testnet.programmingbitcoin.com`. If DNS or outbound network access is blocked, those tests may fail even when the Python environment is installed correctly.

## Useful commands

Deactivate the virtual environment:

```bash
deactivate
```

Reactivate it later:

```bash
cd /path/to/programmingbitcoin
source .venv/bin/activate
```

Start Jupyter again:

```bash
jupyter notebook
```
