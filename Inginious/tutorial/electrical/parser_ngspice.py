from string import *

def main():
	my_file = open("result.txt", 'r')
	
	result = ""
	tokens = my_file.read().split()
	for i in range(len(tokens)) :
		word = tokens[i]
		letters = list(word) 
		if(len(letters) > 2 and (letters[0] == 'v' or letters[0] == 'i') and letters[1] == '(') :
			result += " " + word + ' = ' + tokens[i+2]
		elif(letters[0] == '@') :
			result += " " + word + ' = ' + tokens[i+2]
		my_file.close()
	if(result == " v(w0) = 1.000000e+01 @r1[i] = 2.000000e+00 i(v) = -2.00000e+00") :
		print("True")
	else :
		print("False")

if __name__ == "__main__":
    main()

