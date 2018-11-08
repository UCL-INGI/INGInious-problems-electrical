from string import *

def main():
	my_file = open("result.txt", 'r')
	
	result = ""
	tokens = my_file.read().split()
	for i in range(len(tokens)) :
		word = tokens[i]
		letters = list(word) 
		if(len(letters) > 2 and letters[0] == 'i' and letters[1] == '(') :
			result = tokens[i+2]
			if(float(result) == 1):
				print("True")
			else:
				print("False")
		my_file.close()

if __name__ == "__main__":
    main()

