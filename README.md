# Sim's Small Web Apps Collection

A collection of various small web apps.

Hosted at <https://apps.simshadows.com/>.

## How do I run this?

You can choose to host a complete app, or you can choose to host only the toolchainless parts.

### Running the complete app

First, you need to install node and npm. On Debian, this can be done with:
```
sudo apt-get install nodejs npm
```

Afterwards, you'll need to clone and enter the repo:
```
git clone https://github.com/simshadows/small-web-apps-collection.git
cd small-web-apps-collection
```

Optionally, set up npm with a globals directory (and reopen your terminal session):
```
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
```

Now, install yarn globally (and optionally, check its version):
```
npm install -g yarn
yarn --version
```

Now you're good to go! Build and serve the app using:
```
yarn build
yarn serve
```

### Running just the toolchainless parts

Some parts of the app are completely useable without compiling using node and npm, but any links to compiled parts of the app will be broken.

To host toolchainless, simply host the directory `apps-toolchainless` on a web server.

For example, if you want to use the Python simple server:

```
$ cd small-web-apps-collection
$ python3 -m http.server --directory ./apps-toolchainless
```

## License

Unless stated otherwise, all original source code is licensed under the [*GNU Affero General Public License v3.0 (AGPLv3)*](https://www.gnu.org/licenses/agpl-3.0.en.html).

