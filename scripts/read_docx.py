import zipfile
import xml.etree.ElementTree as ET

def extract_text_from_docx(docx_path):
    try:
        doc = zipfile.ZipFile(docx_path)
        content = doc.read('word/document.xml')
        tree = ET.fromstring(content)
        
        paragraphs = []
        for p in tree.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
            texts = [node.text for node in p.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t') if node.text]
            if texts:
                paragraphs.append(''.join(texts))
        
        return '\n'.join(paragraphs)
    except Exception as e:
        return str(e)

if __name__ == '__main__':
    text = extract_text_from_docx(r'c:\Users\USER\Desktop\closecraft\DSS_Admissions_and_First_Sale_Kit.docx')
    with open(r'c:\Users\USER\Desktop\closecraft\DSS_Admissions_and_First_Sale_Kit.txt', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Done")
