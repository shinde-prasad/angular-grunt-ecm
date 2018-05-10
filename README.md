# Installation

In a command line type:
  npm install -g yo grunt grunt-cli bower
  bower install
  npm install
  grunt

If 'grunt' does not work then try again 'bower install & npm install'


# test

This project is generated with [yo angular generator](https://github.com/yeoman/generator-angular)
version 0.11.0.

## Build & development

Run `grunt` for building and `grunt serve` for preview.

## Testing

Running `grunt test` will run the unit tests with karma.


## Deployment

Run the 'grunt build' command to generate the dist version of the current under development code.
If you get an error related to the images you will need to copy the images to a directory outside of
the project and copy those images back to the project after the build process. The images should be
copied to the dist version too (build result).

The result of this build will be located in the dist/ directory.

If you need to deploy this project to Tomcat you can copy the dist/ directory (if you want you can rename it) to the webapps/ directory under the Tomcat installation


#Contact

acabal@searchtechnologies.com
