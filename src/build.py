import os
from shutil import copyfile
from distutils.dir_util import copy_tree

## merge all js files
final_file = ""
for root, dirs, files in os.walk('js'):
    for file in files:
        with open(os.path.join(root, file), "r") as auto:
            final_file += "//" + file + "\n";
            final_file += auto.read() + "\n\n"

## save final js file
output = open('../dist/js/subtleframe.js','w+')
output.write("class Subtle{}\n\n")
output.write(final_file)
output.close()

## copy files
copyfile("css/style.css", "../dist/css/subtleframe.css")
copy_tree("css/fonts","../dist/css/fonts")
