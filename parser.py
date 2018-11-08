import xml.etree.ElementTree as ET
from string import *
import sys
tree = ET.parse(sys.argv[1])
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

cnt = 1;
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



listComponent = []

for child in root.findall('Component'):
	component = {}
	component['name'] = child.attrib.get('name')
	component['value'] = child.attrib.get('value')
	c = 0
	for node in list_n:
		if child.attrib.get('id') in node:
			n = cnt
			if ground_id in node:
				n = 0
			else:

				n = c + 1
			if listNode[c][node.index(child.attrib.get('id'))][1] == 'i' or  listNode[c][node.index(child.attrib.get('id'))][1]  == 'N' :
				component['node1'] = n
			else:

				component['node2'] = n
		c = c + 1
		if ground_id not in node:
			cnt = cnt + 1
	cnt = 0
	listComponent.append(component)

	
for node in listComponent:
	my_file.write('%s n%s n%s %s\n' % (node.get('name'), node.get('node1'), node.get('node2'), node.get('value')))

my_file.write(".options savecurrents\n\n")
my_file.write(".control\n")
my_file.write("op\n")

for i in range(len(list_n) - 1):
	my_file.write('print V(w%s)\n' % (i))



for child in root.findall('Component'):
	if child.attrib.get('type') == 'Resistor':
		my_file.write("print @%s[i]\n" % (child.attrib.get('name')))
	if child.attrib.get('type') == 'Voltage':
		my_file.write("print I(%s)\n" % (child.attrib.get('name')))

my_file.write("exit\n")
my_file.write(".endc\n")
my_file.write(".end\n")


my_file.close()
