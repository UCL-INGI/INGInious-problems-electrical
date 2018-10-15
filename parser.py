import xml.etree.ElementTree as ET
from string import *
tree = ET.parse('lol.xml')
root = tree.getroot().find('root')
my_file = open("circuitSpice.cir", 'w')
my_file.write("Spice circuit Gen\n\n")


listEdge = []
for child in root.findall('mxCell'):
	if('source' in child.attrib):
		edge= {}
		edge["source"] = child.attrib.get('source')
		edge["target"] = child.attrib.get('target')
		index = child.attrib.get('style').find("sourcePort=")
		edge["sourcePort"] = child.attrib.get('style')[index+11:index+12]
		index = child.attrib.get('style').find("targetPort=")
		edge["targetPort"] = child.attrib.get('style')[index+11:index+12]
		edge["marked"] = True
		listEdge.append(edge)

cnt = 0;
listNode =[]
for edge in listEdge:
	src = edge.get('source')
	src_port = edge.get('sourcePort')
	tgt = edge.get('target')
	tgt_port = edge.get('targetPort')
	for node in listNode:
		if((src, src_port) in node ):
			node.append((tgt, tgt_port))
			edge["marked"] = False
		if ((tgt, tgt_port) in node):
			node.append((src, src_port))
			edge["marked"] = False
	if edge.get('marked'):
		new_node = []
		new_node.append((src, src_port))
		new_node.append((tgt, tgt_port))
		listNode.append(new_node)


list_n = []
for node in listNode:
	new_n = []
	for n in node:
		new_n.append(n[0])
	list_n.append(new_n)

ground = root.find('Ground')
ground_id = ground.attrib.get('id')

for child in root.findall('Component'):
	my_file.write('%s' % (child.attrib.get('name')))
	for node in list_n:
		if child.attrib.get('id') in node:
			if ground_id in node:
				my_file.write(' 0')
			else:
				my_file.write( ' w%s' % (cnt))
		cnt = cnt + 1

	my_file.write(' %s\n' % (child.attrib.get('value')))

	cnt = 0



my_file.close()
