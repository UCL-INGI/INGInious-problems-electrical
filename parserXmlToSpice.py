import xml.etree.ElementTree as ET
tree = ET.parse('cir.xml')
fichier = open("cir.cir", "a")
fichier.write("Génération d'un fichier Spice à partir d'un XML")
root = tree.getroot()
graph = root.find('root')
for child in graph.findAll('mxCell'):
	if(mxCe


class Resistance
	def __init__(self, Name,Value, Wire1, Wire2):
		self.N = Name
		self.V = Value
		self.w1 = Wire1
		self.w2 = Wire2
		 
		
