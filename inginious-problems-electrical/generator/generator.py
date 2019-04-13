import os
import sys
from jinja2 import Template as Temp
from component import *
from edge import *
from split import *
from parser_xml import *
import subprocess
from math import *
from random import *
import tempfile

PATH_TO_PLUGIN = os.path.abspath(os.path.dirname(__file__))

class Cycle():
	def __init__(self, top, right, bot, left, limitT, limitR, limitB, limitL):
		self.top = top
		self.left = left
		self.right = right
		self.bot = bot
		self.limitT = limitT
		self.limitR = limitR
		self.limitL = limitL
		self.limitB = limitB


def rand_circuit(nbrCycles, direct, reverse): 
	# all positions on the external cycle
	top_right = (60.1, 49.8)
	top_left = (10.1, 99.8)
	offset = 100
	nbrCycles = nbrCycles if nbrCycles <= 10 else 10 # can't make more split
	nbrCycles = nbrCycles if nbrCycles > 0 else 1 
	positions_horizontal = []
	for i in range(4) : 
		positions_horizontal.append((top_right[0]+offset*i, top_right[1]))
		# no elements on the bottom, reserved for the ground
	positions_vertical = []
	for i in range(3) :
		positions_vertical.append((top_left[0], top_left[1]+offset*i))
		positions_vertical.append((top_left[0]+offset*4, top_left[1]+offset*i))


	cnt_id = 2
	cycles = [] # save all cycles
	components = {} # save all components by id
	edges = {} # save all edges by 'source+elemID' or 'target+elemID'
	id_ground = 0
	for i in range(nbrCycles):
		rotation = 0
				
		if i == 0 : # first cycle (external cycle)
			# list of components 
			elem_top = []
			elem_right = []
			elem_bottom = []
			elem_left = []

			# add new components
			ElemsInCycle = randint(1, 5)
			for j in range(ElemsInCycle):
				rotation, position = add_rand_pos(positions_horizontal, positions_vertical, elem_top, elem_right, elem_bottom, elem_left, cnt_id, components)
				cnt_id += 1
			elem_top = sorted(elem_top, key=lambda x : x.x)
			elem_right = sorted(elem_right, key=lambda x : x.y)
			elem_left = sorted(elem_left, key=lambda x : -x.y)	
			all_elem = elem_top + elem_right + elem_bottom + elem_left
			cnt_not_empty = 0
			if len(elem_top) > 0 :
				cnt_not_empty += 1
			if len(elem_right) > 0 :
				cnt_not_empty += 1
			if len(elem_left) > 0 :
				cnt_not_empty += 1
			if cnt_not_empty < 3 : # only one side empty allowed otherwise retry
				return rand_circuit(nbrCycles, direct, reverse)

			# add the ground
			pos = (240.1, 349.8)
			id_ground = cnt_id
			cnt_id += 1	
			elem_bottom.append(SimpleComponent(id_ground, pos[0], pos[1]))

			# add edge
			for k in range(len(elem_top)-1) :
				id1 = elem_top[k].id
				id2 = elem_top[k+1].id
				make_edge(cnt_id, "out", "in", id1, id2, 1, edges)
				cnt_id += 1
			make_edge(cnt_id, "out", "in", elem_top[-1].id, elem_right[0].id, 1, edges)
			cnt_id += 1
			for k in range(len(elem_right)-1) :
				id1 = elem_right[k].id
				id2 = elem_right[k+1].id
				make_edge(cnt_id, "out", "in", id1, id2, 1, edges)
				cnt_id += 1
			make_edge(cnt_id, "N", "out", id_ground, elem_right[-1].id, 1, edges)
			cnt_id += 1
			make_edge(cnt_id, "N", "out", id_ground, elem_left[0].id, 1, edges)
			cnt_id += 1
			for k in range(len(elem_left)-1) :
				id1 = elem_left[k].id
				id2 = elem_left[k+1].id
				make_edge(cnt_id, "in", "out", id1, id2, 1, edges)
				cnt_id += 1
			make_edge(cnt_id, "in", "in", all_elem[0].id, all_elem[-1].id, 1, edges)
			cnt_id += 1

			# add external cycle
			cycle = Cycle(elem_top, elem_right, elem_bottom, elem_left, top_right[1], top_left[0]+offset*4, top_right[1]+offset*3, top_left[0])
			cycles.append(cycle)


		else : # add cycle by spliting other cycle
			try :
				component1, component2, direction, cycleChosen, index1, index2 = rand_split(cycles)
			except RecursionError :
				# no more split possible
				return rand_circuit(nbrCycles, direct, reverse)
				break
			
			positions, port1, port2, rotation = compute_split(component1, component2, offset, direction, cycleChosen, id_ground)
			
			# add component on the axis
			nbr_elem = randint(1, len(positions))
			elem_axis = []
			for e in range(nbr_elem) :
				index = randint(0,len(positions)-1)
				position = positions[index]
				del positions[index]
				make_random_component(position, rotation, cnt_id, components)
				elem_axis.append(components.get(cnt_id))
				cnt_id += 1
			elem_axis = sorted(elem_axis, key=lambda x : x.x+x.y) 
			inverse_elem_axis = sorted(elem_axis, key=lambda x : -x.x-x.y) 
			
			# add edge
			if direction == "vertical" :
				make_edge(cnt_id, port1, "in", component1.id, elem_axis[0].id, 1, edges)
			else : # inverse to have a beautiful edge
				make_edge(cnt_id, "in", port1, elem_axis[0].id, component1.id, 1, edges)
			cnt_id += 1
			for ea in range(len(elem_axis)-1) :
				make_edge(cnt_id, "out", "in", elem_axis[ea].id, elem_axis[ea+1].id, 1, edges)
				cnt_id += 1
			if direction == "horizontal" :
				make_edge(cnt_id, "out", port2, elem_axis[-1].id, component2.id, 1, edges)
			else :
				make_edge(cnt_id, port2, "out", component2.id, elem_axis[-1].id, 1, edges)
			cnt_id += 1
			
			# add the two new cycles
			cycle1 = None
			cycle2 = None
			if direction == "vertical" :
				cycle1 = Cycle(None, elem_axis, None, cycleChosen.left, cycleChosen.limitT, elem_axis[0].x, cycleChosen.limitB, cycleChosen.limitL)
				cycle2 = Cycle(None, cycleChosen.right, None, inverse_elem_axis, cycleChosen.limitT, cycleChosen.limitR, cycleChosen.limitB, elem_axis[0].x)
				if port1 == "in" :
					cycle1.top = cycleChosen.top[:index1]
					cycle2.top = cycleChosen.top[index1:]
				else :
					cycle1.top = cycleChosen.top[:index1+1]
					cycle2.top = cycleChosen.top[index1+1:]
				if component2.id == id_ground :
					cycle1.bot = cycleChosen.bot
					cycle2.bot = cycleChosen.bot
				elif port2 == "in" :
					cycle1.bot = cycleChosen.bot[index2+1:]
					cycle2.bot = cycleChosen.bot[:index2+1]
				else :
					cycle1.bot = cycleChosen.bot[index2:]
					cycle2.bot = cycleChosen.bot[:index2]
			else : 
				cycle1 = Cycle(cycleChosen.top, None, inverse_elem_axis, None, cycleChosen.limitT, cycleChosen.limitR, elem_axis[0].y, cycleChosen.limitL)
				cycle2 = Cycle(elem_axis, None, cycleChosen.bot, None, elem_axis[0].y, cycleChosen.limitR, cycleChosen.limitB, cycleChosen.limitL)
				if port1 == "in" :
					cycle1.left = cycleChosen.left[index1+1:]
					cycle2.left = cycleChosen.left[:index1+1]
				else :
					cycle1.left = cycleChosen.left[index1:]
					cycle2.left = cycleChosen.left[:index1]
				if port2 == "out" :
					cycle1.right = cycleChosen.right[:index2+1]
					cycle2.right = cycleChosen.right[index2+1:]
				else :
					cycle1.right = cycleChosen.right[:index2]
					cycle2.right = cycleChosen.right[index2:]
			cycles.append(cycle1)
			cycles.append(cycle2)

	# choose a question among the input questions
	questions = []
	if direct == "on":
		questions.append("directI") if randint(0,1) == 0 else questions.append("directV")
	if reverse == "on":
		questions.append("impI") if randint(0, 1) == 0 else questions.append("impV")
	question_choice = choice(questions)
	
	# voltage question
	if question_choice == "directV" or question_choice == "impV":
		try :
			cnt_id = add_voltage_label(cycles, id_ground, offset, components, edges, cnt_id, "true", "false")
		except RecursionError :
			# no more split possible, can't add label
			return rand_circuit(nbrCycles, direct, reverse)	


	# current question
	if question_choice == "directI" or question_choice == "impI":
		try :
			add_current_label(cycles, components, edges, id_ground, "true", "false")
		except :
			# add current label not possible
			return rand_circuit(nbrCycles, direct, reverse)


	# add source 
	bad_results = []
	bad_results.append((0,0))
	add_source(cycles, components, edges, id_ground, bad_results, None)
	if nbrCycles >= 3 and randint(0,1) == 0:
		add_source(cycles, components, edges, id_ground, bad_results, None)
	

	# dependent source TODO : work but make idiot circuit 
	"""try :
		label = add_current_label(cycles, components, edges, id_ground, "false", "false")
	except :
		# add current label not possible
		return rand_circuit(nbrCycles, direct, reverse)"""
	#add_source(cycles, components, edges, id_ground, bad_results, label)


	# make the xml with jinja
	file = open(PATH_TO_PLUGIN+"/../templates/circuit.xml", "r") 
	template = Temp(file.read())
	file.close()
	edges_id = {}	
	for list in edges.values() :
		for e in list :
			edges_id[e.id] = e 
	xml = template.render(components=components.values(), edges=edges_id.values(), idGround=id_ground)
	

	# simulate and check the circuit
	circuitSpice = tempfile.NamedTemporaryFile(mode="w+")
	answer = tempfile.NamedTemporaryFile(mode="w+")
	result = tempfile.NamedTemporaryFile(mode="w+")
	parse_xml(xml, circuitSpice, answer)
	
	bashCommand = "ngspice "+circuitSpice.name
	process = subprocess.Popen(bashCommand.split(), stdout=result)
	process.communicate()
	result.flush()
	subprocess.call(['cat', result.name])
		
	circuitSpice.close()

	result_lines = []
	for line in open(result.name, "r") :
		result_lines.append(line)
	result.close()
	if result_lines[-1].split()[0] == 'print':
		# bug computation ngspice, bad circuit (ex:inductance alone in paralel with the source)
		return rand_circuit(nbrCycles, direct, reverse)

	
	answers = {}
	for line in open(answer.name, "r") :
		words = line.split()
		answers[words[0]] = (words[2], words[4])
	answer.close()

	for i in range(len(result_lines)) :
		line = result_lines[i]
		words = line.split()

		if(len(words) > 2 and words[0] == "print" and words[1] == "of" and words[2] == "Label" and words[3] in answers) :
			id = words[3][1:]
			spice_real_im = result_lines[i+1].split()[-1].split(",")
			if len(spice_real_im) < 2: 
				# label connected on the mass 
				return rand_circuit(nbrCycles, direct, reverse)
			for c in components.values():
				if int(c.id) == int(id):
					c.set = 'true'
					c.isQuestion = 'false'
					c.value = round(sqrt(float(spice_real_im[0])**2 + float(spice_real_im[1])**2), 2)
					c.phase = round(degrees(atan2(float(spice_real_im[1]), float(spice_real_im[0]))), 2)
					if (abs(c.value), abs(c.phase)) in bad_results: 
						# bad exercice
						return rand_circuit(nbrCycles, direct, reverse)



	# impedence question TODO: replace more than just one component to have real and imaginary values
	# simulate the circuit to have a measure and then hide a composent
	if question_choice == "impI" or question_choice == "impV":
		add_impedance(cycles, components, id_ground)
		xml = template.render(components=components.values(), edges=edges_id.values(), idGround=id_ground)



	return xml




def add_voltage_label(cycles, id_ground, offset, components, edges, cnt_id, isQuestion, set):
	component1, component2, cycleChosen = vert_split_ground(cycles, id_ground)
	positions, port1, port2, rotation = compute_split(component1, component2, offset, "vertical", cycleChosen, id_ground)
	position = (0,0)
	if len(positions)%2 == 0 :
		pos_x = positions[0][0]
		pos_y = (positions[int(len(positions)/2)][1]+positions[int(len(positions)/2)-1][1])/2
		position = (pos_x, pos_y)
	else :
		position = positions[int(len(positions)/2)]
	components[cnt_id] = Label("?", "?", "VoltageLabel", cnt_id, 0, position[0]+25, position[1]-20, isQuestion, set)
	id_label = cnt_id
	cnt_id += 1	
	make_edge(cnt_id, port1, "N", component1.id, id_label, 1, edges)
	cnt_id += 1
	make_edge(cnt_id, port2, "S", component2.id, id_label, 1, edges)
	cnt_id += 1
	return cnt_id

