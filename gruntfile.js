'use strict';


var packagejson = require('./package.json');
var bowerFiles = require('bower-files');

module.exports = function (grunt) {

    // show elapsed time at the end
    require('time-grunt')(grunt);

    
    var beta = grunt.option('beta') || false;
    var alpha = grunt.option('alpha') || false;
    var certificateFile = grunt.option('certificateFile');
    
    var BASENAME = 'crypto-calc';
    var APPNAME = 'CrypotCalc';
    
    if (alpha) {
        APPNAME += ' (Alpha)';
    } else if (beta) {
        APPNAME += ' (Beta)';
    }

    grunt.initConfig({

      bower: {
            install: {
                options: {
                    targetDir: 'bower_components',
                    copy: false
                }
            }
        },
               
        tsd: {
            refresh: {
                options: {
                    command: 'reinstall',
                   //latest: true,
                    config: 'tsd.json'
                }
            }
        },
        
        ts: {
            options: {
                module: 'commonjs',
                sourceMap: true,
                comments: false,
                target: 'es5',
                declaration: false,
                fast : 'never'
            },
            components : {
                 src: ['components/**/*.ts' ]
            },
            ui : {
                 src: ['js/cryptoCalcModule.ts','js/cryptoCalcCommon.ts'],
                 dest : 'js/cryptoCalc.js'               
            },
            test : {
                src: ['crypto-lib/cryptolib-test.ts' ]
            }, 
            cryptolib: {
                src: ['crypto-lib/cryptolib-nodejs.ts']
                
            } 
        },
        browserify : {
            dist: {
            files: {
              'crypto-lib/cryptolib-web.js': ['crypto-lib/cryptolib-nodejs.js'],
            },
            options: {
              exclude : ['crypto','node-forge'],
              browserifyOptions : {
                  standalone : 'webcryptolib'
              }
              
            }
          }
            
        },

        wiredep: {
            app: {
                src: ['index.html','index-web.html'],
                exclude: [
                    /jquery/,
                    /forge/,
                    /angular-mocks/
                ]
            }
        },
        clean: {
          release: ['build/', 'dist/', 'installer/']
        },
        mochaTest: {
            test: {
                options: {
                  reporter: 'spec',
                  quiet: false, // Optionally suppress output to standard out (defaults to false) 
                  clearRequireCache: false // Optionally clear the require cache before running tests (defaults to false) 
                },
                src: ['crypto-lib/cryptolib-test.js']
              }
        },
        copy: {
              base: {
                files: [
                    {
                      expand: true,
                      cwd: '.',
                      src: ['package.json', 'styles/**/*','js/**/*','images/**/*','crypto-lib/**/*'],
                      dest: 'build/'
                    },
                    // bower files
                    {
                      expand: true,
                      src: bowerFiles().relative(__dirname).files,
                      dest: 'build/'
                    },
                   // forge copy all files
                   {
                      expand: true,
                      src: 'bower_components/forge/js/**',
                      dest: 'build/'
                    }

                ]
              },
              components : {
                  files : [
                    {
                      expand: true,
                      cwd: '.',
                      src: ['components/**/*'],
                      dest: 'build/',
                  
                    }
                  ],
                  
                  options: {
                     process: function (content, srcpath) {
                         return content.replace(/VERSION/g,packagejson['version'])
                                       .replace(/AUTHOR/g,packagejson['author'].name)
                                       .replace(/REPO/g,packagejson['author'].url)
                                       .replace(/DATE/g,(new Date()).toString()); 
                     }                 
                  }
              },
              web: {
                  src: 'index-web.html',
                  dest: 'build/index.html'          
              },
              electron: {
                  files: [
                    {
                      expand: true,
                      cwd: '.',
                      src: ['index.html','index.js'],
                      dest: 'build/'                       
                        
                    },            
                    {
                      cwd: 'node_modules/',
                      src: Object.keys(packagejson.dependencies).map(function (dep) { return dep + '/**/*';}),
                      dest: 'build/node_modules/',
                      expand: true
                    }
                ]                       
              }
              
              
        },          
        electron: {
              windows: {
                options: {
                  name: BASENAME,
                  dir: 'build/',
                  out: 'dist/',
                  version: packagejson['electron-version'],
                  platform: 'win32',
                  arch: 'x64',
                  asar: true
                }
              },
              osx: {
                options: {
                  name: APPNAME,
                  dir: 'build/',
                  out: './dist/osx/'+APPNAME+'.app',
                  version: packagejson['electron-version'],
                  platform: 'darwin',
                  arch: 'x64',
                  asar: true,
                  'app-bundle-id': 'lucdew.cryptocalc',
                  'app-version': packagejson.version
                }
              }
            },   
 
        // Need to buy a code signing certificate
        // prompt: {
        //       'create-windows-installer': {
        //         options: {
        //           questions: [
        //             {
        //               config: 'certificatePassword',
        //               type: 'password',
        //               message: 'Certificate Password: '
        //             }
        //           ]
        //         }
        //       }
        //     },           
        'create-windows-installer': {
                  appDirectory: 'dist/' + BASENAME + '-win32/',
                  authors: 'Docker Inc.',
                  //loadingGif: 'images/loading.gif',
                  setupIcon: 'images/lock_2x.ico',
                  //iconUrl: 'https://raw.githubusercontent.com/lucdew/crypto-calc/master/images/crypto-calc.ico',
                  description: APPNAME,
                  title: APPNAME,
                  exe: BASENAME + '.exe',
                  version: packagejson.version
                  //,signWithParams: '/f ' + certificateFile + ' /p <%= certificatePassword %> /tr http://timestamp.comodoca.com/rfc3161'
             }
    
        ,
        compress: {
              main: {
                options: {
                  archive: 'dist/cryptocalc-web.zip'
                },
                files: [
                  {expand: true, cwd:'build',src: ['**/*']}
                ]
              }
        }
     
    });
   
    

    
    
    require('load-grunt-tasks')(grunt); // npm install --save-dev load-grunt-tasks


    //Load NPM tasks
    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-electron-installer');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-compress');

    //Making grunt default to force in order not to break the project.
    grunt.option('force', true);

    //Default task(s).
    
    grunt.registerTask('test',['ts:cryptolib','ts:test','mochaTest']);
    
    grunt.registerTask('buildui',['ts:ui','ts:components']);
    
    grunt.registerTask('buildelectron', [
        'clean',
        'bower',
        'wiredep:app',
        'tsd',
        'ts',
        'mochaTest',
        'copy:base',
        'copy:components',
        'copy:electron',
        'electron:windows',
        'create-windows-installer'       
    ]);
    
    grunt.registerTask('buildweb', [
        'clean',
        'bower',
        'wiredep:app',
        'tsd',
        'ts',
        'mochaTest',
        'browserify',
        'copy:base',
        'copy:components',
        'copy:web',
        'compress'     
    ]);
    
    grunt.registerTask('default', [ 'buildelectron']);

    grunt.registerTask('fullbuild', [
        'clean',
        ''       
    ]);


};
