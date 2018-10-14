import xml.etree.ElementTree as ET
tree = ET.parse('graph.xml')
root = tree.getroot().find('root')
my_file = open("circuitSpice.cir", 'w')
my_file.write("Spice circuit Gen\n\n")

listEdge = []
for child in root.findall('mxCell'):
	if('source' in child.attrib):
		listEdge.append((child.attrib.get('source'),child.attrib.get('target')))

for child in root.findall('Component'):
	my_file.write('%s' % (child.attrib.get('name')))
	for edge in listEdge:
		if child.attrib.get('id') in edge:
			if edge[0] < edge[1]:
				my_file.write(' w%s%s' % (edge[0],edge[1]))
			else:
				my_file.write( ' w%s%s' % ( edge[1], edge[0]))

	my_file.write(' %s\n' % (child.attrib.get('value')))

my_file.close()
