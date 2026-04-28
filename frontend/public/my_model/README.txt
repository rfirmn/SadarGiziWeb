/* FILE: public/my_model/README.txt */
/* Letakkan file ini di: public/my_model/README.txt */

================================================================================
                        PETUNJUK PENEMPATAN MODEL TFJS
================================================================================

Folder ini adalah tempat untuk meletakkan file model TensorFlow.js Anda.

STRUKTUR FILE YANG DIPERLUKAN:
-----------------------------
public/
└── my_model/
    ├── model.json          <- File utama model (WAJIB ada)
    ├── group1-shard1of4.bin <- File weight model (nama bisa berbeda)
    ├── group1-shard2of4.bin
    ├── group1-shard3of4.bin
    ├── group1-shard4of4.bin
    └── README.txt          <- File ini

CARA MENDAPATKAN MODEL:
-----------------------
1. Jika Anda memiliki model YOLO (.pt atau .onnx), konversi ke format TFJS:
   
   # Menggunakan tensorflowjs_converter
   pip install tensorflowjs
   tensorflowjs_converter --input_format=tf_saved_model /path/to/saved_model ./my_model

   # Atau dari Keras model
   tensorflowjs_converter --input_format=keras /path/to/model.h5 ./my_model

2. Jika menggunakan YOLOv5/v8, ekspor ke format TFJS:
   
   # YOLOv5
   python export.py --weights yolov5s.pt --include tfjs
   
   # YOLOv8
   yolo export model=yolov8n.pt format=tfjs

3. Salin semua file hasil konversi ke folder public/my_model/

CATATAN PENTING:
---------------
- Ukuran input model harus 640x640 (sesuai konfigurasi di ModelRunner.jsx)
- Model harus mengeluarkan bounding boxes dengan format yang didukung
- Pastikan model.json berada di root folder my_model/
- Semua file .bin harus ada di folder yang sama dengan model.json

LABEL KELAS:
-----------
Model harus ditraining dengan kelas berikut (urutannya penting):
0: garam
1: gula
2: kalori
3: karbo
4: lemak
5: protein
6: serving
7: takaran-satuan
8: serat

Jika label berbeda, edit array CLASS_LABELS di src/components/ModelRunner.jsx

================================================================================
