import xml.etree.ElementTree as ET
from string import *
import sys

def parse_xml(xml):

	root = ET.fromstring(xml).find('root')
	my_file = open("circuitSpice.cir", 'w')
	my_file.write("Spice circuit Gen\n\n")

	file_answers = open("Answers.txt", 'w')


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



	listNode =[]
	for edge in listEdge:
		src = edge.get('source')
		src_port = edge.get('sourcePort')
		tgt = edge.get('target')
		tgt_port = edge.get('targetPort')
		bool1 = False
		bool2 = False
		node1 = [] 
		node2 = []
		for node in listNode:
			if((src, src_port) in node ):
				edge["marked"] = False
				bool1 = True
				node1 = node
			if ((tgt, tgt_port) in node):
				edge["marked"] = False
				bool2 = True 
				node2 = node
		
		if(bool1 and bool2):
			if node1 is not node2:
				new_node = node1 + node2
				index1 = listNode.index(node1)
				listNode.pop(index1)
				index2 = listNode.index(node2)
				listNode.pop(index2)
				listNode.append(new_node)
		elif bool1:
			index1 = listNode.index(node1)
			listNode[index1].append((tgt, tgt_port))
		elif bool2:
			
			index2 = listNode.index(node2)
			listNode[index2].append((src, src_port))
		
		
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
		component['type'] = child.attrib.get('type')
		if component['type'] == 'DependentVoltage' or component['type'] == 'DependentCurrent':
			component['label'] = child.attrib.get('label')
		if component['type'] == 'VoltageLabel'or component['type'] == 'CurrentLabel':
			component['isQuestion'] = child.attrib.get('isQuestion')
			component['set'] = child.attrib.get('set')
		if child.attrib.get('currentName') is not None and child.attrib.get('currentName') != '':
			component['currentName'] = child.attrib.get('currentName')
			component['direction'] = child.attrib.get('direction')
		if component['type'] == 'Impedance':
			component['real'] = child.attrib.get('real')
			component['imaginary'] = child.attrib.get('imaginary')
		component['phase'] = child.attrib.get('phase')
		c = 0
		cnt = 1
		
		for node in list_n:
			if child.attrib.get('id') in node:
				if ground_id in node:
					n = 0
				else:
					n = cnt
				if listNode[c][node.index(child.attrib.get('id'))][1] == 'i' or  listNode[c][node.index(child.attrib.get('id'))][1]  == 'N' :
					component['node1'] = n
				else:
					component['node2'] = n
			c = c + 1
			if ground_id not in node:
				cnt = cnt + 1
		listComponent.append(component)

	for node in listComponent:
		if node.get('node2') is None:
			node['node2'] = node.get('node1')
		if node.get('node1') is None:
			node['node1'] = node.get('node2')

		
	for node in listComponent:
		if node.get('type') == 'Voltage':
			my_file.write('%s %s %s dc 0 ac %s %s\n' % (node.get('name'), node.get('node1'), node.get('node2'), node.get('value'), node.get('phase')))
		elif node.get('type') == 'Current':
			my_file.write('%s %s %s dc 0 ac %s %s\n' % (node.get('name'), node.get('node2'), node.get('node1'), node.get('value'), node.get('phase')))
		elif node.get('type') == 'VoltageLabel':
			if node.get('isQuestion') == 'true' or node.get('set') == 'true':
				file_answers.write('%s : %s , %s \n' % (node.get('name'), node.get('value'), node.get('phase')))
		elif node.get('type') == 'CurrentLabel':
			my_file.write('V%s %s %s 0\n' % (node.get('name'), node.get('node1'), node.get('node2')))
			if node.get('isQuestion') == 'true' or node.get('set') == 'true':
				file_answers.write('%s : %s , %s \n' % (node.get('name'), node.get('value'), node.get('phase')))
		elif node.get('type') == 'Node':
			continue
		elif node.get('type') == 'Capacitor':
			my_file.write('%s %s %s %s\n' % (node.get('name'), node.get('node1'), node.get('node2'), 1/float(node.get('value'))))
			#Prevent bug with capacitor in series		
			my_file.write('R%s %s %s 10G\n' % (node.get('name'), node.get('node1'), node.get('node2')))
		elif node.get('type') == 'DependentVoltage':
			label = node.get('label')
			dependentnode1 = 0
			dependentnode2 = 0
			typelabel = ''
			namelabel = ''
			for n in listComponent:
				if label == n.get('name'):
					dependentnode1 = n.get('node1')
					dependentnode2 = n.get('node2')
					typelabel = n.get('type')
					break
			if typelabel == 'VoltageLabel':		
				node['name'] = 'E' + node.get('name')	
				my_file.write('%s %s %s %s %s %s\n' % (node.get('name'), node.get('node1'), node.get('node2'), dependentnode1, dependentnode2, node.get('value')))
			elif typelabel == 'CurrentLabel':
				node['name'] = 'H' + node.get('name')	
				my_file.write('%s %s %s %s %s\n' % (node.get('name'), node.get('node1'), node.get('node2'), 'V'+ label, node.get('value'))) 
		elif node.get('type') == 'DependentCurrent':
			label = node.get('label')
			dependentnode1 = 0
			dependentnode2 = 0
			typelabel = ''
			namelabel = ''
			for n in listComponent:
				if label == n.get('name'):
					dependentnode1 = n.get('node1')
					dependentnode2 = n.get('node2')
					typelabel = n.get('type')
					break
			if typelabel == 'VoltageLabel':
				my_file.write('G%s %s %s %s %s %s\n' % (node.get('name'), node.get('node2'), node.get('node1'), dependentnode1, dependentnode2, node.get('value')))
			elif typelabel == 'CurrentLabel':
				my_file.write('F%s %s %s %s %s\n' % (node.get('name'), node.get('node2'), node.get('node1'), 'V'+label, node.get('value'))) 
		elif node.get('type') == 'Impedance':
			if float(node.get('imaginary')) > 0:
				my_file.write('R%s %s %s %s \n' % (node.get('name'), node.get('node1'), len(listNode), node.get('real')))
				my_file.write('L%s %s %s %s \n' % (node.get('name'), len(listNode) , node.get('node2'), node.get('imaginary')))
			elif  float(node.get('imaginary')) < 0: 
				my_file.write('R%s %s %s %s \n' % (node.get('name'), node.get('node1'), len(listNode), node.get('real')))
				my_file.write('C%s %s %s %s \n' % (node.get('name'), len(listNode) , node.get('node2'), -1/float(node.get('imaginary'))))
			else :
				my_file.write('R%s %s %s %s \n' % (node.get('name'), node.get('node1'), node.get('node2'), node.get('real')))
				
		else :
			my_file.write('%s %s %s %s\n' % (node.get('name'), node.get('node1'), node.get('node2'), node.get('value')))
			
			
		

	my_file.write(".options savecurrents\n\n")
	my_file.write(".control\n")
	my_file.write("ac lin 1 0.1591 0.1591\n")

	for n in listComponent:
		if n.get('type') == 'VoltageLabel':
			my_file.write('echo print of Label %s\n' % n.get('name'))
			if n.get('node1') == 0 and n.get('node2') == 0:
				my_file.write('print 0\n')
			elif n.get('node1') == 0:
				my_file.write('print 0 - V(%s)\n' % (n.get('node2')))
			elif n.get('node2') == 0:
				my_file.write('print V(%s) - 0\n' % (n.get('node1'))) 
			else:
				my_file.write('print V(%s) - V(%s)\n' % (n.get('node1'), n.get('node2')))
		if n.get('type') == 'Node':
			my_file.write('echo print of Node %s\n' % (n.get('name')))
			if n.get('node1') == 0:
				#mdr l'utilisateur un peu con
				my_file.write('0')
			else:
				my_file.write('print V(%s)\n' % (n.get('node1')))
		if n.get('type') == 'CurrentLabel':
			my_file.write('echo print of Label %s\n' % n.get('name'))
			my_file.write('print I(V%s)\n' % (n.get('name')))
		if n.get('currentName') is not None :
			my_file.write('echo print of Label %s\n' % n.get('currentName'))
			value = 0
			notSource = True
			if n.get('type') == 'Voltage' or n.get('type') == 'DependentVoltage':
				notSource = False
				if n.get('direction') == '->':
					my_file.write('print 0 - I(%s)\n' % (n.get('name')))
				else:
					my_file.write('print I(%s)\n' % (n.get('name')))
			elif n.get('type') == 'Current':
				notSource = False
				if n.get('direction') == '->':
					my_file.write('print %s\n' % (n.get('value')))
				else:
					my_file.write('print 0 - %s\n' % (n.get('value')))
			if notSource:
				if n.get('type') == 'Resistor':
					value = n.get('value')
				elif n.get('type') == 'Capacitor':
					value =  n.get('value') + '/i'  
				elif n.get('type') == 'Inductor':
					value = n.get('value') + '*i'
				if n.get('direction') == '->' :
					if n.get('node1') == 0 and n.get('node2') == 0:
						my_file.write('print (0 - 0/(%s)\n' % (value))
					elif n.get('node1') == 0:

						my_file.write('print (0 - V(%s))/(%s)\n' % ( n.get('node2'), value))
					elif n.get('node2') == 0:
						my_file.write('print (V(%s) - 0)/(%s)\n' % ( n.get('node1'),  value))
					else:
						my_file.write('print (V(%s) - V(%s))/(%s)\n' % ( n.get('node1'), n.get('node2'), value))
				if n.get('direction') == '<-' :
					if n.get('node1') == 0 and n.get('node2') == 0:
						my_file.write('print (0 - 0)/(%s)\n' % (value))
					elif n.get('node1') == 0:
						my_file.write('print (V(%s) - 0)/(%s)\n' % ( n.get('node2'), value))
					elif n.get('node2') == 0:
						my_file.write('print (0 - V(%s))/(%s)\n' % ( n.get('node1'), value))
					else:
						my_file.write('print (V(%s) - V(%s))/(%s)\n' % ( n.get('node2'), n.get('node1'), value))


	my_file.write("print allv\n")
	my_file.write("exit\n")
	my_file.write(".endc\n")
	my_file.write(".end\n")


	my_file.close()
