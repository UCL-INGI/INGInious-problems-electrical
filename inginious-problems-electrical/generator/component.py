from random import *


class SimpleComponent:
	def __init__(self, id, x, y):
		self.id = id
		self.x = x
		self.y = y

class Component(SimpleComponent):
	def __init__(self, value, type, id, rotation, x, y):
		SimpleComponent.__init__(self, id, x, y)
		self.value = value
		self.type = type
		self.rotation = rotation

class Source(Component):
	def __init__(self, value, phase, type, id, rotation, x, y):
		Component.__init__(self, value, type, id, rotation, x, y)
		self.phase = phase		

class Label(Source):
	def __init__(self, value, phase, type, id, rotation, x, y, isQuestion, set):
		Source.__init__(self, value, phase, type, id, rotation, x, y)
		self.isQuestion = isQuestion
		self.set = set

class Impedance(Component):
	def __init__(self, value, type, id, rotation, x, y, hidden_real, hidden_imaginary):
		Component.__init__(self, value, type, id, rotation, x, y)
		self.hidden_real = hidden_real
		self.hidden_imaginary = hidden_imaginary



def make_random_component(position, rotation, id, components) :
	choice = randint(0, 4)
	value = randint(1, 10)
	if choice >= 0 and choice <= 2 :
		components[id] = Component(value, "Resistor", id, rotation, position[0], position[1])
	elif choice == 3 :
		components[id] = Component(value, "Capacitor", id, rotation, position[0], position[1])
	elif choice == 4 :
		if rotation == 0 :
			components[id] = Component(value, "Inductor", id, 0, position[0], position[1])
		else :
			components[id] = Component(value, "Inductor", id, 90, position[0], position[1])



def add_source(cycles, components, edges, id_ground, bad_results, dependency) :
	elem = None 
	direction = ''
	type = ''
	while type != 'Resistor' and type != 'Capacitor' and type != 'Inductor' : # choose another element
		elem, side, cycleChosen = rand_elem(cycles)
		if elem.id != id_ground :
			type = elem.type
	direction = 'horizontal' if side == 'top' or side == 'bot' else 'vertical'
	rotation = 0 if direction == 'horizontal' else 270
	value = ""
	phase = ""
	new_type = ""
	if dependency is not None:
		value = randint(2, 5)
		phase = "I"+str(dependency.id) if dependency.type == "CurrentLabel" else "V"+str(dependency.id)
		# TODO : add to bad results 
		new_type = 'DependentVoltage' if randint(0, 1) == 0 else 'DependentCurrent'
	else:
		value = randint(1, 20)
		phase = randint(-180, 180)
		bad_results.append((abs(value), abs(phase)))
		new_type = 'Voltage' if randint(0, 1) == 0 else 'Current'
	elem.type = new_type
	components[elem.id] = Source(value, phase, new_type, elem.id, rotation, elem.x, elem.y)
	# update ports
	if 'source'+str(elem.id) in edges :
		for e in edges.get('source'+str(elem.id)) :
			e.source_port = new_port(direction, e.source_port)
	if 'target'+str(elem.id) in edges :
		for e in edges.get('target'+str(elem.id)) :
			e.target_port = new_port(direction, e.target_port)



def add_current_label(cycles, components, edges, id_ground, isQuestion, set):
	elem = None 
	direction = ''
	type = ''
	isok = False
	count = 0
	while not isok : # choose another element
		elem, side, cycleChosen = rand_elem(cycles)
		if elem.id != id_ground :
			type = elem.type
		if can_add_currentLabel(elem, side, cycleChosen, id_ground) :
			isok = True 
		if count > 100 :
			raise Exception('add current label not possible')
		count += 1
	direction = 'horizontal' if side == 'top' or side == 'bot' else 'vertical'
	rotation = choice([0, 180]) if direction == 'horizontal' else choice([90, 270])
	elem.type = "CurrentLabel"
	components[elem.id] = Label("?", "?", "CurrentLabel", elem.id, rotation, elem.x, elem.y, isQuestion, set)
	# update ports
	if 'source'+str(elem.id) in edges and (rotation == 180 or rotation == 270) :
		for e in edges.get('source'+str(elem.id)) :
			e.source_port = 'out' if e.source_port == 'in' else 'in'
	if 'target'+str(elem.id) in edges and (rotation == 180 or rotation == 270) :
		for e in edges.get('target'+str(elem.id)) :
			e.target_port = 'out' if e.target_port == 'in' else 'in'
	return components[elem.id]



def add_impedance(cycles, components, id_ground):
	elem = None 
	direction = ''
	type = ''
	while type != 'Resistor' and type != 'Capacitor' and type != 'Inductor' : # choose another element
		elem, side, cycleChosen = rand_elem(cycles)
		if elem.id != id_ground :
			type = elem.type
	direction = 'horizontal' if side == 'top' or side == 'bot' else 'vertical'
	rotation = 0 if direction == 'horizontal' else 90
	hidden_real = 0
	hidden_imaginary = 0
	if elem.type == 'Resistor':
		hidden_real = elem.value
	elif elem.type == 'Capacitor':
		hidden_imaginary = -elem.value
	elif elem.type == 'Inductor':
		hidden_imaginary = elem.value
	elem.type = "Impedance"
	components[elem.id] = Impedance(0, "Impedance", elem.id, rotation, elem.x, elem.y, hidden_real, hidden_imaginary)


# make sure to not short cut the circuit by adding a current label
def can_add_currentLabel(elem, side, cycle, id_ground):
	count = 0
	for e in getattr(cycle, side):
		if e.id != id_ground and (e.type == 'Resistor' or e.type == 'Capacitor' or e.type == 'Inductor') :
			count += 1
	return count > 1
		

def add_rand_pos(positions_horizontal, positions_vertical, elem_top, elem_right, elem_bottom, elem_left, id, components) :
	rotation = 90*randint(0, 1)
	position = (0,0)
	if rotation == 0 :
		if len(positions_horizontal) == 0:
			return add_rand_pos(positions_horizontal, positions_vertical, elem_top, elem_right, elem_bottom, elem_left, id, components)
		else :
			index = randint(0,len(positions_horizontal)-1)
			position = positions_horizontal[index]
			make_random_component(position, rotation, id, components)
			del positions_horizontal[index]
			if position[1] == 349.8 :
				elem_bottom.append(components.get(id))
			else :
				elem_top.append(components.get(id))
	else :
		if len(positions_vertical) == 0:
			return add_rand_pos(positions_horizontal, positions_vertical, elem_top, elem_right, elem_bottom, elem_left, id, components)
		else :
			index = randint(0,len(positions_vertical)-1)
			position = positions_vertical[index]
			make_random_component(position, rotation, id, components)
			del positions_vertical[index]
			if position[0] == 410.1 :
				elem_right.append(components.get(id))
			else :
				elem_left.append(components.get(id))
	return rotation, position



def rand_elem(cycles):
	indexCycle = randint(0, len(cycles) -1)
	cycleChosen = cycles[indexCycle]
	all_elem = get_all_elem(cycleChosen)
	indexElem = randint(0, len(all_elem) -1)
	if indexElem < len(cycleChosen.top) :
		return all_elem[indexElem], 'top', cycleChosen
	elif indexElem >= len(cycleChosen.top+cycleChosen.right+cycleChosen.bot) :
		return all_elem[indexElem], 'left', cycleChosen
	elif indexElem >= len(cycleChosen.top+cycleChosen.right) :
		return all_elem[indexElem], 'bot', cycleChosen
	else :
		return all_elem[indexElem], 'right', cycleChosen



def get_all_elem(cycle):
	return cycle.top + cycle.right + cycle.bot + cycle.left



def new_port(direction, port):
	if direction == 'horizontal' :
		return 'S' if port == 'in' else 'N'
	else :
		return 'N' if port == 'in' else 'S'


