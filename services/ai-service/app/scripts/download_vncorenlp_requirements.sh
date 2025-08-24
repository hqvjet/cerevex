#!/bin/bash

mkdir -p tools/vncorenlp/models/wordsegmenter

wget https://raw.githubusercontent.com/vncorenlp/VnCoreNLP/master/VnCoreNLP-1.1.1.jar
wget https://raw.githubusercontent.com/vncorenlp/VnCoreNLP/master/models/wordsegmenter/vi-vocab
wget https://raw.githubusercontent.com/vncorenlp/VnCoreNLP/master/models/wordsegmenter/wordsegmenter.rdr

mv VnCoreNLP-1.1.1.jar tools/vncorenlp/
mv vi-vocab tools/vncorenlp/models/wordsegmenter/
mv wordsegmenter.rdr tools/vncorenlp/models/wordsegmenter/