from random import *

def can_split_vert(cycle) :
	left_elem, right_elem, top_elem, bot_elem = cycle.left, cycle.right, cycle.top, cycle.bot
	if not top_elem or not bot_elem :
		return False
	if (len(top_elem) > 1 and len(bot_elem) >= 1) or (len(top_elem) >= 1 and len(bot_elem) > 1) :
		return True
	if not left_elem and not right_elem :
		return False
	if not left_elem :
		if int(top_elem[0].x+50) == int(right_elem[0].x) :
			return False
		else :
			return True
	if not right_elem :
		if int(top_elem[0].x-50) == int(left_elem[0].x) :
			return False
		else :
			return True
	if int(right_elem[0].x - left_elem[0].x) == 100 :
		return False
	return True



def can_split_hor(cycle) :
	left_elem, right_elem, top_elem, bot_elem = cycle.left, cycle.right, cycle.top, cycle.bot
	if not left_elem or not right_elem :
		return False
	if (len(left_elem) > 1 and len(right_elem) >= 1) or (len(left_elem) >= 1 and len(right_elem) > 1) :
		return True
	if not bot_elem and not top_elem :
		return False
	if not bot_elem :
		if int(left_elem[0].y-50) == int(top_elem[0].y) :
			return False
		else :
			return True
	if not top_elem :
		if int(left_elem[0].y+50) == int(bot_elem[0].y) :
			return False
		else :
			return True
	if int(bot_elem[0].y - top_elem[0].y) == 100 :
		return False
	return True



def vert_split_ground(cycles, id_ground) :
	indexCycle = randint(0, len(cycles) -1)
	cycleChosen = cycles[indexCycle]
	if can_split_vert(cycleChosen) :
		t_cycle = cycleChosen.top
		b_cycle = cycleChosen.bot
		index1 = randint(0, len(t_cycle)-1)
		component1 = t_cycle[index1]
		index2 = 0
		while index2 < len(b_cycle)-1 and b_cycle[index2+1].x >= component1.x : 
			index2 += 1
		component2 = b_cycle[index2]
		if component2.id == id_ground :
			return component1, component2, cycleChosen
	return vert_split_ground(cycles, id_ground) # if split impossible, try another one



def rand_split(cycles) :
	indexCycle = randint(0, len(cycles) -1)
	cycleChosen = cycles[indexCycle]
	split = randint(0, 1)
	if split == 0 and  can_split_hor(cycleChosen) :
		l_cycle = cycleChosen.left
		r_cycle = cycleChosen.right
		index1 = randint(0, len(l_cycle)-1)
		component1 = l_cycle[index1]
		index2 = 0
		# TODO : don't take just the closer element 
		while index2 < len(r_cycle)-1 and r_cycle[index2+1].y <= component1.y : 
			index2 += 1
		component2 = r_cycle[index2]
		del cycles[indexCycle]
		return component1, component2, "horizontal", cycleChosen, index1, index2
	if split == 1 and can_split_vert(cycleChosen) :
		t_cycle = cycleChosen.top
		b_cycle = cycleChosen.bot
		index1 = randint(0, len(t_cycle)-1)
		component1 = t_cycle[index1]
		index2 = 0
		while index2 < len(b_cycle)-1 and b_cycle[index2+1].x >= component1.x : 
			index2 += 1
		component2 = b_cycle[index2]
		del cycles[indexCycle]
		return component1, component2, "vertical", cycleChosen, index1, index2
	return rand_split(cycles) # if split impossible, try another one



def compute_split(component1, component2, offset, direction, cycleChosen, id_ground) :
	port1 = ""
	port2 = ""	
	rotation = 0		
	positions = []
	if direction == "horizontal" :
		nbr_position = int(((component2.x-offset/2)-(component1.x+offset/2))/offset) + 1
		axis = 0 # axis where the new components are adding
		if component1.y == component2.y and int(component1.y-offset/2) == int(cycleChosen.limitT) : # both components at the top
			port1 = "out"
			port2 = "out"
			axis = component1.y + offset/2
		elif component1.y == component2.y and int(component1.y+offset/2) == int(cycleChosen.limitB) : # both components at the bottom
			port1 = "in"
			port2 = "in"
			axis = component1.y - offset/2
		elif component1.y > component2.y : 
			port1 = "in"
			port2 = "out"
			axis = component1.y - offset/2
		elif component1.y < component2.y :
			port1 = "out"
			port2 = "in"
			axis = component1.y + offset/2
		else :
			if randint(0, 1) == 0 :
				port1 = "in"
				port2 = "in"
				axis = component1.y - offset/2
			else :
				port1 = "out"
				port2 = "out"
				axis = component1.y + offset/2
		for np in range(int(nbr_position)) : 
			positions.append((component1.x+offset/2+offset*np, axis))
	if direction == "vertical" :
		nbr_position = int(((component2.y-offset/2)-(component1.y+offset/2))/offset) + 1
		axis = 0 # axis where the new components are adding
		rotation = 90
		if component1.x == component2.x and int(component1.x-offset/2) == int(cycleChosen.limitL) : # both components on the left
			port1 = "out"
			port2 = "out"
			axis = component1.x + offset/2
		elif component1.x == component2.x and int(component1.x+offset/2) == int(cycleChosen.limitR) : # both components on the right
			port1 = "in"
			port2 = "in"
			axis = component1.x - offset/2
		elif component2.id == id_ground and int(component1.x-offset/2) == int(cycleChosen.limitL) : # close left connected to the ground
			port1 = "out"
			port2 = "N"
			axis = component1.x + offset/2
		elif component2.id == id_ground and int(component1.x+offset/2) == int(cycleChosen.limitR) : # close right connected to the ground
			port1 = "in"
			port2 = "N"
			axis = component1.x - offset/2
		elif component1.x > component2.x : 
			port1 = "in"
			if component2.id == id_ground :
				port2 = "N"
			else :
				port2 = "out"
			axis = component1.x - offset/2
		elif component1.x < component2.x :
			port1 = "out"
			if component2.id == id_ground :
				port2 = "N"
			else :
				port2 = "in"
			axis = component1.x + offset/2
		else :
			if randint(0, 1) == 0 :
				port1 = "in"
				port2 = "in"
				axis = component1.x - offset/2
			else :
				port1 = "out"
				port2 = "out"
				axis = component1.x + offset/2
		for np in range(int(nbr_position)) : 
			positions.append((axis, component1.y+offset/2+offset*np))
	return positions, port1, port2, rotation
