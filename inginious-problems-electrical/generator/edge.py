class Edge:
	def __init__(self, id, source_port, target_port, source, target, visible):
		self.id = id
		self.source = source
		self.target = target
		self.visible = visible
		self.source_port = source_port
		self.target_port = target_port



def make_edge(id, source_port, target_port, source, target, visible, edges) :
	e = Edge(id, source_port, target_port, source, target, visible)
	if "source"+str(source) in edges :
		edges["source"+str(source)].append(e)
	else :
		edges["source"+str(source)] = [e]
	if "target"+str(target) in edges :
		edges["target"+str(target)].append(e)
	else :
		edges["target"+str(target)] = [e]


