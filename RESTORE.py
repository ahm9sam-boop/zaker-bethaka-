# Rebuild folders: python RESTORE.py  (files named a__b__c.ext -> a/b/c.ext)
import os, shutil
for n in os.listdir('.'):
    if '__' in n and n != 'RESTORE.py':
        p = n.replace('__', '/')
        os.makedirs(os.path.dirname(p), exist_ok=True)
        shutil.move(n, p)
