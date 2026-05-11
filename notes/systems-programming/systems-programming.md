[..](../index.md)
> Systems Programming (CSE 20289)
> Prof. [Collin McMillan](https://sdf.org/~cmc/), Fall 2025

"How to use a computer, from a computer scientist's perspective"

2025-08-25
===
Arthur C. Clark 1961 Daisy Bell story
- (leaves deeply disturbed, goes on to write 2001 a space odyssey)
- role of humans vs. machines
- proud engineers (human endeavor) vs. (disturbing?) experience interfacing w/ computer 
- computer scientist vs. consumer experience

"Thinking" Machines, 1959 Alex Bernstein
- how do we interface with machines?

PDP 7, a few years later
- "gimmick": typer and printer in one device ("not a big deal")
- a lot faster
- $30-40M, significant portion of time sitting idle
- wouldn't it be great if multiple people could use it at the same time?

enter: UNIX operating system (AT&T)
- had to:
- interface with (multiple) users
- total dictatorship over hardware (main control over machine)
    - the picture (going outward concentrically):
        - center: kernel
        - drivers (helper programs, interface with hardware)
        - user programs (can make request for kernel to do things)
        - outer part: the shell

2025-08-27
===
recap: kernel --> drivers --> user programs --> shell
What are the main components of a compuer?
- CPU (Central Processing Unit)
- short term memory (relatively less ways to store)
- long term memory (lots of different ways to store these)
- some interface
^ all connected by some kind of bus that drives between each

The problem: need multiple different people to access multiple different forms of long term storage
- Screams for standardization!
- centered around the file system

basic demo in the terminal: `pwd`, `mkdir`, `ls -alh`, `vim`, `uname -a`, `cd`

root folder: `/`

cmc showing his motherboard on the doc cam:
- cpu, ram
- 512mb nvme ssd (fast but expensive) - connected directly to motherboard "bus"
- 4TB hard drive (magnetic spinning platter, slow) - plug into Serial ATA (SATA) ports

`lsblk -e 7`
nvme ssd mounted to `/`
hard drive mounted to `/mnt/tmp`
- Can easily copy file from one device to another (everything completely transparent from file system)

file system "basically" has two things: directories and files
- its structure is maintained by inodes
    - in a library you have all of the books but also all the indexes to the books
two types of inodes: directory inodes and file inodes

dir inode
- contains inode #s of files inside

file inode
- id
- permissions
- owner
- date
- ...
- data location pointer

`stat hi.txt` gives file inode info^
- every file has a Gid (group owner) and Uid (user owners)

`chown cmc:users hi.txt`
- edited the inode to add hi.txt to group

`ln hi.txt othername.txt` 
- changes directory inode to add another filename with same inode number (two entries for the same book)
- called a hard link

`ln -s hi.txt other2.txt`
- have different inode numbers
- creates another file inode whose data location points to the same file
- called a symlink (symbolic link)

(hidden folders start with `.`)

**permissions**
- three types of permissions: read access, write access, and execute access

grouped in threes:
(d or -) --- user access --- group access --- world access

`chmod -w hi.txt`
- write priveledge goes away (read only)
change back by `chmod +w hi.txt`

`chmod u+w` only user can write
`chmod g+w` only group can write
`chmod a+w` all can write

also have codes (octal codes):
`chmod 777 hi.txt`
`chmod 600 hi.txt`
`chmod 644 hi.txt`

rwx 111 7
rw  110 6
r x 101 5
r   100 4
 wx 011 3
 w  010 2
  x 001 1


2025-08-29
===
In a navy warehouse:
600 pallets * 45 boxes = ~27000 boxes filled with punch cards
27000 * 2000 punched cards = ~54 million cards
54 million cards * 80 characters = ~4.3 billion characters = ~4.3GB
- data is piling up! need a way to search and deal with all of it. (computers)
- Unix developed so that multiple people could log in and search through datasets at same time

### misc. commands shown on cmc@reptar
`lsblk -e 7` lists info about devices, ignoring loopback (virtual) devices

you can add `time` to the start of any command to show how long it takes
mv is faster than cp:
- Every file has an inode, directories are basically name -> inode# tables.  
- `mv` just removes the old inode # from the source directory and adds it to the target directory. No file data is moved on disk.
- `cp` actually reads and writes the file contents to a new inode.
- mv keeps the same inode, preserving permissions, ownership, timestamps, and hard links; cp creates a new inode (use cp -p to preserve metadata).
- moving/copying onto another device (e.g. /scratch) slower (Unix shows it all as one big tree, but different mount points are separate filesystems)
    - moving across filesystems forces `mv` to fall back to copy+delete because inodes are unique per filesystem, and is just as slow as cp.

- there is an environment variable named $PATH
`echo $PATH` -> where the shell knows where to go hunting for executable files
`which vim` -> /usr/bin/vim

### regex!

`dog+`: dog, dogg, doggg, ... (1 or more g's)
`dog*`: do, dog, dogg, ... (0 or more g's)
`dog?`: do, dog (0 or 1 g's)
`(dog)+`: dog, dogdog, dogdogdog, ...
`dog{1,4}`: dog, dogg, doggg, dogggg (1 to 4 g's)
`(dog|cat)`: dog, cat (dog or cat)

use `\` to escape special characters
`\s` for any whitespace character (space, tab, etc.)
could do `\s+` for any number of spaces

`^` means start of line
`$` means end of line

`.` means any single character (except for new lines `\n`!)
so, `.*` matches anything, repeated any number of times in a single line

`\w` means any "word" character - any alphanumeric character (letters A-Z, a-z, digits 0-9, and underscore _)

`[abc]` set for a, b, or c
`[a-z0-9]`
`[a-zA-Z0-9]`

`\b` indicates a word boundary
`\d` is any digit (0–9)


### searching through files: `sed`
- uses "regular expressions" (regex)

`find` prints out all files and folders (recursively) underneath cwd
^ can pipe the output of this into another program!

`find | sed -nE ''`
-n suppresses automatic printing; -E enables extended regular expressions (so you don't need to escape things like +, ?, |, or parentheses)

search and replace: `s/searchingfor/replacewith/gp` (g means global/whole string, p means print it out)

ex: `find | sed -nE 's/\.\/Movies\/(.*)\/(.*)\.mkv/\1/p' `
    - takes the path like `./Movies/<dir>/<file>.mkv` and prints just the directory name (`\1`)

- can then pipe into `sort` to sort by alphabetical order:
    `find | sed -nE 's/\.\/Movies\/(.*)\/(.*)\.mkv/\1/p' | sort`
- and even remove duplicates!
    `find | sed -nE 's/\.\/Movies\/(.*)\/(.*)\.mkv/\1/p' | sort | uniq -c` (-c optionally counts the number of each occurrence)
- and then sort again!
    `find | sed -nE 's/\.\/Movies\/(.*)\/(.*)\.mkv/\1/p' | sort | uniq -c | sort -rh`
    (-r for reverse, -h for human-numeric sort - otherwise would treat these values as strings and sort them alphabetically, so "10M" would come before "2G")


2025-09-01
===
2014: Yahoo had password database breached (plain text usernames and passwords)

`cat yahoo.clean.txt | sed -nE '/obama/p'`

`cat yahoo.clean.txt | sed -nE '/obama/p' | uniq`
- uniq only removes duplicates that are right next to each other!!!
So, we must sort first:
`cat yahoo.clean.txt | sed -nE '/obama/p' | sort | uniq -c | sort -rh`

`cat yahoo.clean.txt | sed -nE '/^[a-z]+[0-9]+[a-z]+$/p' | sort | uniq -c | sort -rh`

`cat yahoo.clean.txt | sort | uniq -c | sort -rh`

- we need s/ (search and replace / subsitute) if we want to replace text: ...

`cat shakespeare.txt | sed -nE 's/friend/pal/p'`

- ...or use groups () to manipulate and return what we want: (groups are numbered in order left to right: \1, \2, ...)

`cat yahoo.clean.txt | sed -nE 's/^([a-z])+([0-9])+([a-z])+$/\1/p' | sort | uniq -c | sort -rh`

`cat yahoo.clean.txt | sed -nE 's/^([a-z])+([0-9])+([a-z])+$/\1\2\3/p' | sort | uniq -c | sort -rh` (this just replicates what we find)


building a bash script (bash is the shell we are using)
- bash is "bourne again shell" which started as an sh-compatible implementation, has more advanced stuff

use shebang at top of bash script:
`#!/bin/bash`
creates a new bash shell and then runs command inside it

ex: 
```sh
#!/bin/bash

TEXTDOC=$1
NOUN=$2

cat $TEXTDOC | sed -nE "s/$NOUN/pal/p"
```
- $1 and $2 refer to first and second command line arguments
- !!! Need to use double quotes "" with sed if using a variable ('' means interpret it literally)


2025-09-03
===
> intro analogy about layers of the earth and the shell, lithosphere

`/etc` - holds system-wide configuration files

- bash is a product of 1980s technology - the 80s were a strange time!
- sometimes we have to live with things the way they were given to us (regardless, Bash and C have stood the test of time!)

### variables in bash
NO SPACES!!!
```sh
MYVAR=$1
ANOTHER=$2 # if no second argument, will default to ""
echo $MYVAR
```
`echo $#` - number of command line arguments

### if statements:
```sh
if [ $MYVAR -lt 7 ];
then
    echo "myvar is less than 7";
else
    echo "not less than 7";
fi
```
^use single brackets, not double brackets (older/more supported)

### The open bracket `[` is not a symbol!! Bash is simple.  Everything is a command to run another program
`[` calls `test`, -lt is a command line argument (less than)

another example:
`echo "5 + 4" | bc -l`

### storing things:
`VAR=$(echo "5 + 4" | bc -l)` - command output capturing
`echo $VAR` --> 9 ! YAY! SO EZ!

adding 1 to a variable:
`NEWVAR=$(echo "$VAR + 1" | bc -l)`

### for loops:
format: `seq [FIRST] [INCREMENT] LAST` (increment is optional, defaults to 1)
`seq 1 2 10`
1
3
5
7
9
```sh
VAR=$1

for i in $(seq 0 $VAR); do
    echo "something $i"
done
```

### working with strings:
`STR="testing"`
`echo ${#STR}` --> 7 (length of string)

substring format: ${variable:offset:length}
`echo ${STR:2:4}` --> stin

we can loop through each letter in a string:
```sh
VAR=$1

for i in $(seq 0 ${#VAR}); do
    echo "something: ${VAR:i:1}"
done
```

### case statements:
```sh
VAR=$1
case $VAR in
    -m) echo "mario" ;;
    -l) echo "luigi" ;;
    *) echo "player not supported" ;;
esac
```

### functions:
```sh
MYVAR=$1
foo()
{
    local VAR=$1        # refers to the first argument of the function (~different scope)
    echo "$VAR"
    let RETFOO=57       # how we return variables in bash
}

echo "$VAR"     # prints a newline (nothing)

foo 5           # prints 5

echo "$VAR"     # prints 5 (unless we add "local" before VAR inside of foo)

echo "$RETFOO"  # prints 57
```

2025-09-05
===
### in bashwrk folder:
`cat shakespeare.txt | sed -nE "s/^([a-zA-Z ,]+\?)$/\1/p" `
- prints all lines with questions in shakespeare.txt

`cat shakespeare.txt | sed "s/^\s+([a-zA-Z ,]+)\..*$/\1/p" | sort`
- prints all the names used in shakespeare (looks for period, e.g. "    HAMLET. asdf")

Let's turn these into a script:
```sh
# step 1) set globals

# * in bash, we actually do want to set global variables at the top of our scripts
SED="sed -nE" # potentially useful for switching to different machines

# step 2) usage message

usage(){
    cat 1>&2 <<EOF
Usage: $(basename $0) <FILENAME> <FORMAT> <REGEX_TYPE>

FILENAME    The name of the file with the Shakespeare data.

FORMATS     u: print in uppercase
            l: print in lowercase

OPERATIONS  q: extract questions
            n: extract names

EOF
    exit $1
}

# step 3) function area

set_regex(){
    local WHICHREGEX=$1 # remember, refers to first parameter of that function, not first parameter of program
    
    if [ $WHICHREGEX != 'q' ] && [ $WHICHREGEX != 'n']; then
        echo "invalid operation"
        exit 1
    fi

    case $WHICHREGEX in
        q) REGEX="^([a-zA-Z ,]+\?)$"; GRP="\1" ;; 
        n) REGEX="^\s+([a-zA-Z ,]+)\..*$"; GRP="\1" ;;
        # if we didn't want to use the if statement above, we could have used  *)  here
    esac
}

set_format(){
    FORM=$1

    case $FORM in
        u) OPTIONS="\U" ;;
        l) OPTIONS="\L" ;;
    esac
}

# step 4) handle parameters

FILENAME=$1
P_FORMAT=$2
P_OPERATION=$3

if [ $# -ge 3 ]; then
    set_regex $P_OPERATION
    set_format $P_FORMAT
else
    usage 1
fi

# step 5) run the command

cat $FILENAME | $SED "s/$REGEX/$OPTIONS$GRP/p"
```
### 5 sections of bash script:
- globals
- define usage (describes what you want your script to do for user)
- functions
- parameters
- calls/command


2025-09-08
===
- Welcome to Jurrasic Park Scene
- `dinosaurs.dat` (a real dataset with a lot of mess)
    - contains every single dinosaur find up to a certain date

### starting in `zipcodes.dat`, semicolon delimited

`cat zipcodes.dat | sort -t';' -k2,2`
- `-t` sets delimeter to ';'
- `-k` sets key to sort based on the i-th specified element
- `-k2,2` means start at 2 and stop at 2 (`-k2` would sort starting at 2 and include everything after it)

to sort across a range we can do
`cat zipcodes.dat | sort -t';' -k2,4`
- start at second and stop at fourth

to sort by two different values we can pass multiple k's:
`cat zipcodes.dat | sort -t';' -k2,2 -k1,1`
- sorts based on second value first, then based on first

### awk

`cat zipcodes.dat | awk -v FS=';' '{print $1,$3;}'`
- prints first and third element
- `-v` allows us to define variables before processing is done
- `FS` is "Field Separator".  Here we define ';' as our delimeter (default is whitespace)
- note: `;` at the end of print is just the syntax to end the command

But default output delimeter is also space! So we can do:
`cat zipcodes.dat | awk -v FS=';' -v OFS=';' '{print $2,$1,$3;}'`
- `OFS` is "Output Field Separator

technically we don't need cat with awk:
`awk -v FS=';' -v OFS=';' '{print $1,$3;}' zipcodes.dat`
but...awk is old.
gawk is newer...(but like 1992 still)
we don't want to trust awk/gawk to read files (differences in file systems, etc)!

`cat zipcodes.dat | awk -v FS=';' -v OFS=$'\t' '{print $2,$1,$3;}'`
tab might get confused between awk and bash - we send it to bash with `$` first to be safe

conditions:
`cat zipcodes.dat | awk -v FS=';' -v OFS=$'\t' 'NR<=6 {print $2,$1,$3;}'`
`cat zipcodes.dat | awk -v FS=';' -v OFS=$'\t' 'NR>1 {print $2,$1,$3;}'`
- `NR` "Number of Records", means line number

we can also filter:
`cat zipcodes.dat | awk -v FS=';' -v OFS=$'\t' '$2~/Augusta/ {print $2,$1,$3;}'`
`cat zipcodes.dat | awk -v FS=';' -v OFS=$'\t' '$1~/4661[0-9]/ {print $2,$1,$3;}'`
`cat zipcodes.dat | awk -v FS=';' -v OFS=$'\t' 'NR>1 && $2~/4661[0-9]/ {print $2,$1,$3;}'`
`cat zipcodes.dat | awk -v FS=';' -v OFS=$'\t' 'NR<10 || $2~/4661[0-9]/ {print $2,$1,$3;}'`
bottom line: if using regex in awk, be very explicit because it can have slightly different meanings (e.g. `+` behaves differently)
- if you want to make more complicated expressions, pipe to sed and then back to awk

`cat dinosaur.dat | awk -v FS=$'\t' '$19<=-89.55222 && $19>=-91.55222 && $20>=39.134957 && $20<=41.134957 {print ;}'`
- finds dinosaurs near where Prof. McMillan is from
- `{print ;}` just means print everything. Here, we might want a number like `$15` to print the name of dinosaur, etc.


2025-09-10
===
### recap from hw:

`'...'` takes everything inside as is

`"..."` will interpret variables inside.
- If we don't want `$1` to evaluate to an external variable (e.g. in awk) we need to escape the symbol: `\$1`

`VAR=$(...)` will run `...` and store it in `VAR`

### find most northerly dinosaur:

`cat dinosaur.dat | awk -v FS=$'\t' -v OFS=$'\t' '{print $6, $19, $20}' | sort -t$'\t' -k3,3hr | head -n 10`

### talked about dinosaurs for a while :)

### some more bash stuff
parameter reading:
`$#` tells you the number of parameters

```sh
while [ $# -gt 0 ] do
    case $1 in
        -h) echo "got h"; echo $2; shift; ;; # captures 2 things and shifts left twice
        -a) echo "got a"; ;;
    esac
    shift # shifts parameters to the left and throws first away ($2 becomes $1, etc.)
```

reading from a file:
```sh
cat bash_notes.txt | while IFS= read -r line; do # while input file separator is nothing (read whole line)
    echo $line
done
```
- here, exactly the same as doing `cat bash_notes.txt`


2025-09-12
===
### Review for Exam
File permissions (octal codes):
rwx 111 7
rw  110 6
r x 101 5
r   100 4
 wx 011 3
 w  010 2
  x 001 1

- be able to interpret `ls -alh`
    - permissions, 1 (?), user owner, group owner, size, date last modified, filename

can change permissions:
`chmod g+r dinosaur.dat` - allows group to read
`chmod 777 dinosaur.dat` - rwx for all

might have to do something like
`VAR=$(ls -alh dinosaur.dat`
and do something with it!
- for example: print out owner of a file:
`echo $VAR | awk -v FS=' ' '{print $3}'`


`stat dinosaur.dat`
two types of inodes - directory inodes and file inodes:
    - a directory inode is basically like an index
    - tells you which files are there
    - essentially a table of names, and their inode number
    - I can make a hardlink, which has different name but same inode number
    - can also make softlink, which has different inode number but its file inode points to same file

Example command that we want to make a script build up to:
`cat dinosaur.dat | awk -v IGNORECASE=1 -v FS=$'\t' -v OFS=$'\t' '$6~/tyrannosaur/ {print $6, $19, $20}'`
will be generalized as:
`cat $FILENAME | $AWK $AWKARGS "$AWKPROG"`

### wrote example program for what to expect for exam
(didn't copy, but main point - have good structure!)

2025-09-15
===
Exam 1

2025-09-17, 2025-09-19, 2025-09-22
===
Wednesday class was canceled
Friday class just went over exam 1 solutions
Monday class was canceled

2025-09-24
===
- motivating example about bash: teleradiology - 1987 early system
- weird high fashion
- steve jobs visiting xerox and being blown away by gui
- xerox - smalltalk: everything is an object!
- smalltalk was the high fashion of computing
- 1991 first version of python released (much too weird to be adopted for a while)
    - no language specification release, guido just built interpreter
    - everything is an object

```python
>>> name=5
>>> type(name)
<class 'int'>
>>> name="Max"
>>> type(name)
<class 'str'>
>>> dir(name)
['__add__', '__class__', '__contains__', '__delattr__', '__dir__', '__doc__', '__eq__', '__format__', '__ge__', '__getattribute__', '__getitem__', '__getnewargs__', '__gt__', '__hash__', '__init__', '__init_subclass__', '__iter__', '__le__', '__len__', '__lt__', '__mod__', '__mul__', '__ne__', '__new__', '__reduce__', '__reduce_ex__', '__repr__', '__rmod__', '__rmul__', '__setattr__', '__sizeof__', '__str__', '__subclasshook__', 'capitalize', 'casefold', 'center', 'count', 'encode', 'endswith', 'expandtabs', 'find', 'format', 'format_map', 'index', 'isalnum', 'isalpha', 'isdecimal', 'isdigit', 'isidentifier', 'islower', 'isnumeric', 'isprintable', 'isspace', 'istitle', 'isupper', 'join', 'ljust', 'lower', 'lstrip', 'maketrans', 'partition', 'replace', 'rfind', 'rindex', 'rjust', 'rpartition', 'rsplit', 'rstrip', 'split', 'splitlines', 'startswith', 'strip', 'swapcase', 'title', 'translate', 'upper', 'zfill']
>>> name.replace("M", "D")
'Dax'
>>> help(name.replace) # shows usage
```
python is dynamically typed!
```python
def foo(x, y):
    return x+y

foo(5,6) # 11
foo("He", "lloo") # Helloo
```
in python, everything is an object, and resources come from modules

using regex in python:
```python
import re

matches = re.findall(r"\d+", "The airplane has 130 seats and 111 passengers.")
# r means "raw string", which means to be interpreted literally

# iterables
for match in matches:
    print(match)

matches = re.findall(r"aiRpLAnE", "The airplane has 130 seats and 111 passengers.", re.IGNORECASE)

# re also has search (find first occurence)
first_letter_a = re.search("a", "The airplane has 130 seats and 111 passengers.", re.IGNORECASE)

print(len(matches)) # 1
```

### some extended notes on `re` functions:

- `re.search(pattern, string)` -> returns first Match object or `None`  
```python
m = re.search("a", "The airplane", re.IGNORECASE)
if m: print(m.group(), m.start())  # a 4
#  ^ match satements are "truthy"
```
- `re.findall(pattern, string)` -> returns list of strings or `[]`
```python
nums = re.findall(r"\d+", "abc123def456")
if nums: print(nums)  # ['123', '456']
#  ^ empty list [] is falsy
```
- `re.finditer(pattern, string)` -> returns iterator of Match objects
```python
   for m in re.finditer(r"\d+", "abc123def456"):
       print(m.group(), m.start())
       # 123 3
       # 456 9
```

### Data Frame (just a list of lists)
```python

f = open("movies.dat", "r")

df = list() # using this as dataframe

for line in f: # yay this is so much nicer than bash!!! (f is an iterable)
    print(line)
    # line is also an object!
    dataitems = line.split("::") 
    print(dataitems[1]) # prints movie name

    # could also store as a tuple
    (mid, nameyear, genrelist) = line.split("::") 
    
    # let's just store the whole linesplit
    df.append(dataitems)

print(df[2][2])
```

### Reading input
```python
import sys
# EVERYTHING IS AN OBJECTTTTTTT WOOOOO
filename = sys.argv[1] # (just like in c)

f = open(filename, "r")
# Don't forget to close file after you're done!
f.close()
...
```

2025-09-26
===
```python
import sys
import re
import pdb

f = open("movies.dat", "r")

pdb.set_trace()

for line in f:
	(mid, nameyear, genres) = line.split("::")
	
	mid = int(mid)

f.close()
```
way to debug: in the server side, because that would require serializing a socket
- ask: "what assumptions am I making?"
- use debugger!!!

Navigation:
`b` / `break [line | func]` - set a breakpoint (e.g. `b 23` or `b my_func`)  
`cl` / `clear` - clear all breakpoints (`cl 2` clears one)  
`c` / `continue` - continue execution until next breakpoint  
`n` / `next` - execute next line (don't step into functions)  
`s` / `step` - step into the next function call  
`r` / `return` - run until the current function returns  
`q` / `quit` - exit the debugger  

Inspection:
`l` / `list [start,stop]` - show source around current line  
`a` / `args` - display arguments of the current function  
`p [expr]` - print the value of an expression  
`pp [expr]` - pretty-print an expression  
`whatis [expr]` - show the type of an expression  
`w` / `where` - show the current call stack  
`u` / `up` - move up one frame in the call stack  
`d` / `down` - move down one frame  
`break` - list all current breakpoints and their numbers  

dataframe.py:
```python
class Dataframe:
	def __init__(self, headers): # self is a reference to the instance of the object you are using right now
		self.dataframe = list()
		self.dataframe.append(headers)
		# or could do something like self.headers = headers
	def append(self, l):
		self.dataframe.append(l)
	
```

2025-09-29
===
- do chairs exist?
```python
def noodle(x):
    return 2 * x

def tofu(x):
    return 3 * x

def mittens(fluffy, boots):
    cleo = fluffy 
    # preprocessing
    def muffin():
        print(boots(cleo))
    # postprocessing
    return muffin

felix = mittens(853497, noodle)
felix()

felix = mittens(91, tofu)
felix()
```
- when you define a function, variables outside of its scope get their values at the time that the function is defined
    - this concept is called a closure

- currying: transforming a function with multiple arguments into a sequence of functions each taking a single argument.

```python
import pdb
import time

cached = dict()

def cache(fcn):
    def inner(a):
        if a not in cached.keys():
            cached[a] = fcn(a)
        return cached[a]
    return inner

@cache # python decorator: same as expensive = cache(expensive)
def expensive(a):
    time.sleep(3)
    return a+1

#expensive = cache(expensive)

pdb.set_trace()
expensive(5)
expensive(5) # much faster
```

2025-10-01
===
Intro Video: "The Computer Chronicles - The Internet (1993)"

- origin of the internet: highly distributed system to protect against government collapse in case of nuclear attack

### Key things to know:
1. MAC Address (aka "Hardware Address")
- unique to each physical device
- used as a local address (think first name vs. last name)

2. IP Address
- like a telephone number

program called `traceroute` to get messages sent from each computer that is traversed 
```
[maxficco@pinatubo] ~ $ traceroute server.maxfic.co                               12:00
traceroute to server.maxfic.co (15.204.248.135), 64 hops max, 40 byte packets
 1  10.12.0.1 (10.12.0.1)  5.705 ms  4.698 ms  4.840 ms
 2  core9500-hu1-0-12.guest.gw.nd.edu (172.21.2.53)  4.722 ms
    core9500-hu2-0-11.guest.gw.nd.edu (172.21.2.57)  3.425 ms  3.387 ms
 3  172.21.2.66 (172.21.2.66)  5.727 ms  4.456 ms  5.324 ms
 4  jbr0-inside.gw.nd.edu (129.74.248.65)  5.066 ms  5.255 ms  5.117 ms
 5  et-4-2-1.402.rtr.ictc.indiana.gigapop.net (149.165.183.33)  11.654 ms  10.485 ms  10.815 ms
 6  ae-9.0.rtr.ll.indiana.gigapop.net (149.165.255.102)  10.879 ms  11.541 ms  12.625 ms
 7  ae-7.1.rtr2.chic.indiana.gigapop.net (149.165.255.93)  13.609 ms  15.925 ms  13.947 ms
 8  lo-0.1.rtr.star.indiana.gigapop.net (149.165.255.11)  13.615 ms  13.547 ms  14.281 ms
 9  149.165.183.86 (149.165.183.86)  13.866 ms  13.833 ms  13.209 ms
10  r-equinix-isp-ae0-2401.ip4.wiscnet.net (140.189.9.133)  13.305 ms  13.394 ms  13.776 ms
11  eqx.chi.ovh.net (208.115.136.152)  14.755 ms  15.192 ms  16.459 ms
12  * * *
13  * * *
```

3. Hostname
- name of computer (for human convenience only)
- `ip addr`
- DNS needed for  hostname <-> IP address

4. Port
- tells computer where to send stuff from the internet (which program)
- operating system assigns port numbers to programs kare bound
    - ex: ssh is port 22
- 65k port numbers

5. Packets
- when you send a message from one computer to another, the data is broken down into tiny packets that are sent
- like a bunch of envelopes, which are then reconstructed on the other side

6. Sockets
- two sides
    - server: person who picks up the call
    - client: person who calls the number
- each has an ip address and a port number
- bind, listen, accept, send, recv, connect

2025-10-03
===
- using `traceroute` from South Bend, Indiana to Augusta, Illinois
	- jump through a lot of nd.edu
	- then through indiana.gigapop.net - sorta like ND's internet service provider

- port is just a way of routing to a particular program on a computer
- netcat - `nc`
- "everything" is either server (listening) or client (sending)

- `nc -l 9999` starts listening on port 9999 (port 9999 is now bound/cannot be used by other programs)
- then we can do `nc localhost 9999`
	- `locahost` is the local machine that you are on

`sudo tcpdump port 9999 -i lo -s0` "snoops" on the connection 
`... IP localhost.57196 > localhost.9999 ...`
- shows seq packet ids, length of packet
- localhost.9999 responds with `ack` for "acknowledge"
- note that a client port has a port number associated with it too!

weird analogy:
- on the server side, when you pick up the call, it is as though a new phone materializes and you set the old phone back down

* first 1024 ports are reserved for admin


2025-10-06
===
### analogy: take-out kitchen with a telephone in it
- when we receive a connection, person (t0) picks up the phone (s), and a new phone (c) materializes
- multi-threading: new person clone (t1) picks up (c) phone
	- clone (t1) cooks food and stuff, then when delivers food
	- phone disappears (`c.close()`)
	- clone dies :(
- Can have multiple threads (t1, t2, etc.) running at same time
- person t0's only job is to accept calls, materialize new phone, and spawn a new person

### in code:
```python
import threading

def somefunct(a, b, c):
    ...

th = threading.Thread(target=somefunc, args=(x, y, z))

th.start()
```
if we implemented this for our dinoserver socket example, can handle multiple connections at once! (don't need to wait for inner while statement to finish and close)

concurrency problems: multiple threads need to use the same resource (they need to take turns!)

python was designed in an era when having more than one core/thread available was rare
- solved concurrency problems by not allowing concurrency
enter: Abominable snowman shaped monster named G.I.L.
- Global Interpreter Lock
- micromanages the movements of each "thread", so it ends up being just as though it were one thread

```
C=compute, S=store
C
C - cpu bound
S - i/o bound
| (takes a long time)
C
C
S
| (takes a long time)
C
C
S
...
```
Now let's use threading (with GIL)
```
t0 t1
C 
C     (compute and store can each only happen one at a time)
S  C
|  C
C  S
C  |
S  
| (takes a long time)
C
C
S
```
- note that even if we were able to solve the concurrency issues and not use GIL, it wouldn't matter in this case where the i/o bound operations take so long

but if my task were instead:
```
C
C
C
S
(x3)
```
then with GIL:
```
C
C
C
S C
  C
  C
C S
C
C
S
```
without GIL:
```
C C C
C C C
C C C
S
  S
    S
```
Moral of the story: GIL is a frustrating monster (yay python 3.14!)

2025-10-08
===
- G.I.L. gives the illusion of doing multiple things at once when in fact it is not.
- pseudo-threading

```python
import ray
import time

ray.init(log_to_driver=False)

@ray.remote # decorator that takes the function and "drops it" in the new space where it operates
def foo(x):
    time.sleep(x)
    print(x) # useless print statement! no console in this new space
    return(x*x)

f1 = foo.remote(4) # submits a task to Ray and returns a future object (ObjectRef), not the actual result
f2 = foo.remote(2) # ^these are IOU's

f1r = ray.get(f1) # blocks the main process until the remote task finishes, then retrieves the computed result
f2r = ray.get(f2) # ^ redeems IOU's (in any order, when I want)

print(f1r)
print(f2r)

# can also do with lists:
futures = [ foo.remote(i) for i in range(2,5)]

fr = ray.get(futures)
print(fr)

```

2025-10-10
===
What is a program actually?
- just a set of instructions (list of things cpu has to do)

when I execute program, the os will create a space in memory for that program to run
- program code will be copied from long term storage (disk) to memory

`ps -ef` lists all the processes running on a machine

- every process has a process id
- can type `kill <PID>`
- when we use ray, lots of processes created to run stuff in new spaces!
    - e.g., `foo.remote(5)` doesn't run on the main process
- behind the scenes, a network socket is created to communicate with the new process
    - what is sending over that socket? How do you do that?
- sockets just send bytes, so we need to serialize
- serialization means to take an object in memory and turn it into a string of bytes that we can then send somewhere
- in python, serialization library is called pickle
```python
import pickle

a = "hello"

pickle.dump(a, open('a.pkl', 'wb')) # wb is write bytes

```

`xxd a.pkl` shows the bytes, where we can find "hello"!

now:
```python
import pickle

a = pickle.load(open('a.pkl', 'rb')) # rb is read bytes

print(a)
```
- ray is doing this for the inputs and outputs of functions
- sending pickles over sockets!

- you cannot serialize socket objects or open files (~only objects that are internally consistent that do not depend on external things can be serialized)
- this means that we can't do parallelism in the server side, because that would require serializing a socket

### examples before exam
```python
import socket
import sys
import ray

ray.init(log_to_driver=False)

@ray.remote
def scktwrk(host, port):
    try:
        s = socket.socket()
        s.settimeout(2)
        s.connect((host, port))

        hostver = s.recv(64)
        hostver = hostver.decode('utf-8')
        hostver = hostver.rstrip()

        s.close()

    except OSError as ex:
        hostver = "<connection refused>"

    except socket.timeout as ex:
        hostver = "<connection timeout>"

    except ConnectionRefusedError as ex:
        hostver = "<connection refused>"

    return (f'{host}:{port}\t{hostver}')


f = open(sys.argv[1])

futures = list()

for line in f:
    line = line.rstrip()
    (host, port) = line.split(':')
    port = int(port)

    futures.append(scktwrk.remote(host, port))

f.close()

for scktfuture in futures:
    resp = ray.get(scktfuture)
    print(resp)
```

```python
import random

princesses = [ 'cinderella', 'belle', 'ariel', 'moana' ]

dinosaurs = [ 'tyrannosaur', 'allosaur', 'raptor' ]

def fate(func):
    def wrapper(princess):
        outcome = random.choice(['run', 'defeat', 'eaten'])
        dino = random.choice(dinosaurs)
        func(princess)
        if outcome == 'run':
            print(' was able to run away')
        elif outcome == 'eaten':
            print(f' got eaten by {dino}')
        else:
            print(f' defeated the {dino} in epic single combat')
    return wrapper

@fate
def princess_print(princess):
    print(f'{princess}', end='')

for princess in princesses:
    princess_print(princess)
```

2025-10-13
===
Exam 2

2025-10-15
===
deeper dive into processes - "what killed student10.cse.nd.edu?"

- logging onto student machines drops you in a new bash shell
- running programs creates a new process that runs programs (instructions are things on disk that happen to be executable)

- ex: run `ls` means "please operating system execute these instructions from disk"
analogy - bash must prostrate himself before the solar deity (the operating system)
- operating system creates a new process to run ls - becomes bash's child process
- boundaries around processes are very strict
- operating system has total control, its job is to keep things isolated 
- bash can't just reach into the ls process (have to communicate through a socket, just as though it were on a different computer)

### lifecycle of a process
- os bestows parenthood 
1. start state (more like not-ready state)
    - loads instructions, sets up memory space
2. ready/sleep state (program is loaded)
    - interruptable sleep (could be woken up to continue running at any moment)
    - uninterruptable sleep (waiting on something necessary for the process to continue, usually i/o)
3. running state (can go back and forth from sleep)
4. killed state
5. or...zombie state (sits there occupying resources with a return value for a parent that never comes to collect it)

some letter states you'll see:
T start
R eady
S leep (I or U)
K illed
Z ombie

- every process has some return value (exit status)

`echo $?` - prints return value of previously ran command

- it is the parents job to collect the return value
- parent has to go over to process, request return value, and go back
- operating sytem maintains process space until that return value is collected

- sometimes there are bad parents...
- maybe parent got busy doing something else or got frozen/died
- operating system can't destroy these zombie child processes!

### now why did student10 break?
- usually we run `ps` as `ps ef`, which shows:
PID - every process is assigned a unique id number 
TTY
STAT - status (usually S or R)
TIME
COMMAND - shows command ran (`\_` denotes which commands are children of other commands)

`ps axfo user,pid,ppid,stat,command` - a for all processes, x shows background stuff, f shows process tree, o allows us to specify which headers we want
USER - user who ran command
PPID - parent process id

> demo using ray to create multithreaded processes in python
- we can see all the child processes created by ray!
Aside: Ray is useful for doing cluster programming because it can be scaled up really easily and run processes on different machines

- weak point: raylet manager - what if we kill the raylet manager?
- usually fine, but what if I froze the raylet manager by creating way too many processes?
    - it wouldn't crash, which would mean that the python process that owned it would be still alive
    - all the raylet children become zombies
- then contagion across file system of multiple machines...!

2025-10-17
===
### Recap on processes:
- A process uses the operating system when it wants to do privileged or managed actions (create children, access resources, send signals)
    - these requests go through system calls
- When a process (parent) creates another process (child), the child runs independently
    - but... the parent is still responsible for collecting the child's return value (exit status).
- If the child finishes and the parent does not collect its return value, the child becomes a zombie (defunct) process

### Demo:
- Program creates a child process that finishes in 5 seconds but the parent does not clean it up!
    - using `ps xfo user,pid,ppid,stat,command`, we child labeled as zombie (state Z / defunct).

- What if we kill this lazy parent process manually?
    - Because it ends cleanly/as the os excpects, a special process called init will become the new adoptive parent of the zombie children
    - init will clean up by "reaping the abandoned zombie children" (actual technical language!)
        - gets all the return values and puts them in some log file
- Otherwise, a lingering parent that crashes/hangs/freezes can leave zombie processes indefinitely

```c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/types.h>

int main(void) {
    pid_t pid = fork();
    if (pid < 0) {
        perror("fork");
        return 1;
    }
    if (pid == 0) {
        sleep(5);
        _exit(0);
    } else {
        printf("parent pid=%d child pid=%d -- sleeping 60s\n", getpid(), pid);
        sleep(60);
    }

    return 0;
}
```

### inter-process communication (ICP)
Signals are a lightweight IPC mechanism that deliver small integer-coded messages to a process.

Common examples:
- SIGINT: interrupt from keyboard (Ctrl+C) - typically number 2.
- SIGTERM: termination request (default for kill) - typically number 15.
- SIGKILL: forceful kill (kill -9) - number 9 - cannot be caught/ignored by the process.
- SIGUSR1, SIGUSR2: user-defined signals (numbers vary) for application-level use.

**remember: kill is just a program that sends signals to processes**

- Note: a process may only send signals to other processes owned by the same user (the kernel enforces this)

### What actually happens when you press Ctrl+C?
- Ctrl+C is delivered not to the program but to the shell (bash)
- the shell then sends a signal to the process (SIGINT, which is just a 2)
    - The program recieves this signal and then (in theory) knows to clean up close (via default handler)

But we can override this behavior!
- A process can install a custom handler for signals (override the default handler) using OS APIs (example in python below):
```python
import signal
import time

def handle_signal(signum, frame):
    print('haha no')

signal.signal(signal.SIGINT, handle_signal) # overrides Ctrl+C !!
signal.signal(signal.SIGUSR1, handle_signal) # overrides kill -10 <PID>
signal.signal(signal.SIGTERM, handle_signal) # overrides default kill <PID> command !!

signal.signal(signal.SIGKILL, handle_signal) # ERROR; not allowed by OS :( ... kill -9 <PID> will always kill the process (but uncleanly)

while True:
    time.sleep(1)
```

- System call: a request of a process to the operating system (create process, send signal, open file, etc.)
- Remember, everything must go through the operating system! (we need to both ask to send the signal and ask to override the handler)

- Note that signal handlers allow one process to control the behavior of another process (cause another function to execute)
    - but... it only received instruction code to execute that function - no data received! (foreshadowing...more ICP to come...)


2025-10-27
===
Recall egg analogy of OS:
kernel <- libraries/drivers <- programs <- shell

- when we run a python program, we are in the program space
- python is an interpreted language (lines are translated in real time and 
- different from a compiled language which is comverted to machine code prior to executing
- recipe analogy: some people like to immediately go step by step (interpreted), while others like to get all the ingredients first and then start (compiled)

4 steps involved in compiling a program (say, `wrk.c`):
`gcc -o wrk wrk.c` does everything all in one (or we can do certain steps individually and combine others in order)
colloquially we call this "compiling" a program, even though compilation is just one step

1. preprocessing -> `wrk_.c`

`cpp wrk.c > wrk_.c` (cpp is the C PreProcessor)
- takes all of the includes (.h files), and copies their code alongside your code into `wrk_.c`

2. compiling -> `wrk.s`

`gcc -S -o wrk.s wrk_.c`
- converts from C code to human-readable assembly instructions
- the assembly code will depend on the cpu architecture

3. assembling -> `wrk.o`

`as -o wrk.o`
- assembles human readable instructions to machine readable binary instructions
- `.o` is called an object file
- it is in binary, so we can only read it with something like `xxd`

- just because the computer can now read the code, we still need to make it executable...
- in out analogy, each object file is like a recipe card
    - sometimes we have multiple recipe cards for a meal! Sometimes there are dependencies (think thanksgiving)!

4. Linking -> `wrk` (or `wrk.exe` on windows)

`gcc -o wrk wrk.o`

- now we get "hello world!"

### Example
say we just had this file, foo.c
```c
int foo() {
    return (0);
}
```
`cpp foo.c > foo_.c`
`gcc -S -o foo.s foo_.c`
`as -o foo.o foo.s`
`gcc -o foo foo.o` -> gives an error! (there is no main function)

returning to solar-deity analogy of of the operating system:
- each process can only operate within its little box
- bash, for example, can ask the solar-deity kindly to run a program

### (zooming in) What are these little boxes?
- the kernel has given you an area of memory:
```
ffffffffffffffff
_________________
Stack (grows downward)
- contains function local variables
______ vv _______


______ ^^ _______
Heap (grows upward)
- from malloc, calloc, free
_________________               ^^ created at runtime (above)^^   vv (below) created at compile time vv
DATA - FIXED SIZE
- contains global variables, static variables, constant strings
_________________
(Text) Code
- contains machine code to run program
_________________
0000000000000000
```

- the kernel goes to long term memory (disk) and copies them into memory
- then it looks inside code segment for a label called main
- if it doesn't see that, it can't execute because it doesn't know where in memory to start!

- one of the first things linking does is make sure that your program has an entry point
- also makes sure that all dependencies are available

### Let's update our wrk.c
```c
#include <stdio.h>
#include "foo.h" // quotes mean look in current directory

int main() {
    int a = foo();
    printf("hello world!\n");
    return 0;
}
```
foo.h:
```c
int foo(); // preprocessor step will put this in wrk.c
```

`cpp wrk.c > wrk_.c`
`gcc -S -o wrk.s wrk_.s`
`as -o wrk.o`
going fine so far...
if we look in wrk.s, we will see `call    foo` (but we have never given it foo!)

`gcc -o wrk wrk.o` -> fails! "undefined reference to `foo`"


okay, let's fix this:
`gcc -o libfoo.o foo.s` -> still gives an error (

`gcc -fPIC -shared -o libfoo.so foo.c` -> creates a shared object file

`gcc -o wrk wrk.c` _still_ gives an error!
we have to tell it to look for foo...
`gcc -o wrk wrk.c -lfoo` _still_ gives an error! ("cannot findd -lfoo")
we have to tell it where to look for foo...
`gcc -o wrk wrk.c -lfoo -L.` <- `-lfoo` looks for `libfoo.so` or `libfoo.a`
- lib prefix is convention; we could link directly by just doing `./foo.so` (if we built it as `foo.so`, for example) in place of `-lfoo`

now we're good...
`./wrk` -> gives an error!! ("error while loading shared libraries: libfoo.so: cannot open shared object file ...")
we _also_ have to tell bash where to look for foo...

`LD_LIBRARY_PATH=. ./wrk` 
creates environment variable for bash to use, so that when it goes before the solar deity to ask it to run the program, it has all the info!
now it is working :)

2025-10-29
===

hypothetical memory map (a lot more going on under the hood of course):
```
-----
stack     <--grows with function calls, variable assignments
----- 3A
 v

 ^
-----
heap      <--dynamically allocated variables (malloc, calloc, etc.)
----- 2A
data      <--global variables, string literals, static variables (fixed size)
----- 1A
code      <--this is where the os puts our code!
----- 0A
```
- addresses go (from bottom to top) low to high

- this space is viewable to us a a contiguous block of memory (so far as we are concerned, as the process running this space)
    - not actually a contiguous block of physical memory (it is contiguous _virtual_ memory!!!)
- the kernel (os) allocates memory for the address space of a process
    - from where??
    - the OS is an imperfect solar deity (only has so much short term memory - RAM, i.e. "the memory")
    - as a practical matter, we might have enough memory to use but not enough contiguous space to fit a large block without breaking it up
        - virtual memory (allows us to split it up, isolation allows multiple processes to coexist safely)
- physical memory - actual RAM in the system, typically from address `0` up to the total capacity (e.g., 0–32 GB).
- virtual memory - the full range of possible memory addresses that the CPU can reference (much larger)
    - a process gets a contiguous block of virtual memory, but addresses in virtual memory might map to different blocks across physical memory
	
```c
#include <stdio.h>

int main()
{
    int i = 48;
    int j = 54;
    int k = 62;

    int *p = &i; // most people write it like this. But the star is not acting on p!
    int* q = &j; // this is a bit more legibly accurate

    printf("%d\n", i);
    printf("%p\n", &i);

    printf("%d\n", *p);
    printf("%p\n", p); // p holds an address
    printf("%p\n", &p); // but p also has an address
    return(0);
}
```
Stack (hypothetical, assuming ints and pointers are 1 byte):

| Label | Address | Value |
| ----- | ------- | ----- |
| i     | Ox3F    | 48    |
| j     | Ox3E    | 54    |
| k     | Ox3D    | 62    |
| p     | Ox3C    | 0x3F  |
| q     | Ox3B    | 0x3E  |
|       | 0x3A    |       |
|       | 0x39    |       |
|       | 0x38    |       |

`&` is "address of"
`*` is "value pointed to by"

2025-10-31
===
### Makefiles

A Makefile automates compilation by encoding build rules so you can just run `make`.
- Only rebuilds what changed (timestamp-based)
- Encodes dependencies explicitly
- Standardizes the build process

Basic structure:
```
target: dependencies
 <TAB> command

```
- target: what you’re building
- dependencies: files it depends on
- command: how to build it (MUST be tab-indented)

### The `all` Target

By convention, `all` means "build everything".

```makefile
all: libfoo.so wrk

libfoo.so: foo.c
	gcc -fPIC -shared -o libfoo.so foo.c

wrk: wrk.c foo.h libfoo.so
	gcc -o wrk wrk.c -lfoo -L.

clean:
	rm -f wrk libfoo.so
```

When you run `make` on its own:

1. Make defaults to the first target (`all`)
2. It checks whether each dependency exists and is up to date
3. It rebuilds only what changed
4. `all` usually has no commands — it’s just an alias

### Shared Libraries (`.so`)

- Shared libraries live on disk and are loaded at runtime!
- Their code is not copied into the executable!
- Library code is typically mapped read-only into memory
- Multiple programs can share the same loaded library

Build a shared library:
`gcc -fPIC -shared -o libfoo.so foo.c`
- `-fPIC`: position-independent code (required for shared libs)
- `-shared`: produce a `.so`

### Static Compilation (Contrast)

- Static linking copies library code into the executable
- Can be useful for compatibility or deprecated libraries
- Not best practice for general use

Example:
`gcc -static main.c`

Result:
- Larger binary
- No runtime dependency on shared libraries

### C Declarations (Historical Note)

- Older C style required declarations at the top of functions
- This was considered best practice for a long time
- Modern C allows mixed declarations and code


2025-11-03
===
### Recap
"compiling" refers to the build process from human code to machine-readable code

what happens when we run an executable?
- creates a new address space
- takes executable code form long term storage
- copies instructions into code and data segment of the memory space

- code and data segment are READ ONLY
- heap and stack are READ+WRITE
    - heap grows upward
    - stack grows downward (as you add local variables/function calls, it moves toward lower addresses)

### Arrays in Memory / Function Calls
Stack (hypothetical, assuming ints and pointers are 1 byte):

| Label             | Address | Value         |
| ----------------- | ------- | ------------- |
| (foo creates) a   | Ox3F    | 65 (ary[2]??) |
|                   | Ox3E    | ary[1]        |
| (bar creates) ary | Ox3D    | ary[0]        |
|                   | Ox3C    |               |
|                   | Ox3B    |               |
|                   | 0x3A    |               |
|                   | 0x39    |               |
|                   | 0x38    |               |

- this simplified memory table doesn't show all the details of other variables created
	- that's why below, we needed to access index 30 in class
```c
#include <stdio.h>

void bar()
{
    char ary[2];
    printf("bar: %p\n", (&ary[30])); // the address of ary[30] is the same as the address of a !!!
    ary[30] = 66;
}

void foo()
{
    int a = 65;
    bar();
    printf("foo: %p\n", &a);
    printf("bar: %d\n", a);
}

int main()
{
    foo();
    return(0);
}
```
- terrible coding practice, but very instructive!

Key points:
- Arrays declared in a function live on the stack
- Stack frames are logically separate but reuse the same memory locations
- When a function returns, its stack space is reclaimed

Implication:
- Array index out-of-bounds errors can reach into adjacent stack frames
- Bugs with unpredictable behavior often indicate uninitialized memory


### Strings in memory
- recall, a string is just an array of characters
- and characters are nothing more than integers that we chose to represent certain symbols
```c
foo() {
	char s[4] = "abc";
	char *t = "def";
	char *q = malloc(4*sizeof(char));
	q[1] = 'a';
	
}
```

(HYPOTHETICAL, ASSUMING INTS AND POINTERS ARE 1 BYTE)
Stack:

| Label | Address | Value |
| ----- | ------- | ----- |
|       | Ox3F    | '\0'  |
|       | Ox3E    | 'c'   |
|       | Ox3D    | 'b'   |
| s     | Ox3C    | 'a'   |
| t     | Ox3B    | 0x1C  |
| q     | 0x3A    | 0x29  |

Heap (remember, grows up):

| Label | Address | Value |
| ----- | ------- | ----- |
|       | Ox2F    |       |
|       | Ox2E    |       |
|       | Ox2D    |       |
|       | Ox2C    | --    |
|       | Ox2B    | --    |
|       | 0x2A    | a     |
|       | 0x29    | --    |


Data Segment (compiler puts variables in here - location is implementation dependent):

| Label | Address | Value |
| ----- | ------- | ----- |
|       | Ox1F    | '\0'  |
|       | Ox1E    | 'f'   |
|       | Ox1D    | 'e'   |
|       | Ox1C    | 'd'   |
|       | Ox1B    |       |
|       | 0x1A    |       |

Remember: data segment is READ-ONLY!
```c
t[1] = 'q';
```
- the behavior of this is undefined/implementation dependent
- sometimes the compiler gives an error, sometimes there is an error at runtime, or sometimes it just drops the assignment silently and does nothing.
- sometimes this might actually work!  In that case, the compiler silently creates stack space, copies over from the data segment, modifies it, and then changes the pointer t to point to an address in the stack.  (can cause a whole lot of confusion)

### Example: reading a line into a buffer
```c
#include <stdlib.h>
#include <stdio.h>

int readline(FILE *fp, char *buf, int maxlen)
{
    char c;
    int i = 0;

    while(i<maxlen && (c = fgetc(fp)) != '\n')
    {
        buf[i] = c;
        i++;
    }

    return(i);
}

int main()
{
    FILE *fp;

    fp = fopen("test.txt", "r");

    int maxlen = 128;
    char *buf = malloc(maxlen * sizeof(char));

    int r = readline(fp, buf, maxlen);

    printf("read %d bytes: %s\n", r, buf);

    return(0);
}
```
- the buffer is allocated in the heap
- functions are working collaboratively to modify the same space!

2025-11-05
===
### reading in multiple lines in C

why don't we just do `char[20000][4000]` ?
- memory is cheap after all!
- but not good practice

```c
char** foo() {
	int maxlen = 3;
	char* linesA[4];
	linesA[0] = malloc(maxlen*sizeof(char));
	linesA[0][0] = 'w';
	
	char ** linesB = malloc(4*sizeof(char*));
	linesB[0] = malloc(maxlen*sizof(char));
	linesB[0][0] = 'q';
	
	return linesB;
}

void bar() {
	char **strings = foo();
}
```
- maybe LinesA is good, if we have strings of different lengths and want to be able to access
- but as soon as foo returns, the pointers in the stack disappear
	- memory leak!
- alternative: with LinesB, we store both the pointers and the strings in the heap!
	- then if we return linesB from foo, no memory is lost!

(HYPOTHETICAL, ASSUMING INTS AND POINTERS ARE 1 BYTE)
Stack:

| Label  | Address | Value |
| ------ | ------- | ----- |
|        | Ox3F    | --    |
|        | Ox3E    | --    |
|        | Ox3D    | --    |
| linesA | Ox3C    | 0x26  |
| linesB | Ox3B    | 0x29  |
|        | 0x3A    |       |
Heap (remember, grows upward.  Labels don't actually exist, but just for clarity):

| Label     | Address | Value |
| --------- | ------- | ----- |
|           | Ox2F    | --    |
|           | Ox2E    | --    |
| linesB[0] | Ox2D    | 'q'   |
|           | Ox2C    | --    |
|           | Ox2B    | --    |
|           | 0x2A    | --    |
| linesB    | 0x29    | 0x2D  |
|           | 0x28    | --    |
|           | 0x27    | --    |
| linesA[0] | 0x26    | 'w'   |

### Let's look at some code:
```c
#include <stdio.h>
#include <stdlib.h>

void does_work(char ** msg)
{
	msg[0] = malloc(3 * sizeof(char));
	msg[0][0] = 'a';
	msg[0][1] = 'b';
	msg[0][2] = '\0';

	msg[1] = malloc(2 * sizeof(char));
	msg[1][0] = 'c';
	msg[1][1] = '\0';
}

void print_work(char ** msg)
{
	printf("%s\n", msg[0])
	printf("%s\n", msg[1])
}

int main()
{
	char **msg;
	msg = malloc(2 * sizeof(char *));

	does_work(msg);
	print_work(msg);

	return(0);
}
```
**great exam question:** "draw a hypothetical memory map of this C code"

### Reading multiple lines
```c
#include <stdlib.h>
#include <stdio.h>

int readline(FILE *fp, char *buf, int maxlen)
{
    char c;
    int i = 0;

    while(i<maxlen && (c = fgetc(fp)) != '\n')
    {
        buf[i] = c;
        i++;

        if (c == EOF)
        {
            i = -1;
            break;
        }
    }

    return(i);
}

int main()
{
    int n;
    int i = 0;
    FILE *fp;

    fp = fopen("test.txt", "r");

    int maxlen = 128;
    int maxlines = 100;
    char **lines = malloc(maxlines * sizeof(char *));
    char *buf;// = malloc(maxlen * sizeof(char));

    while(n!=-1)
    {
        buf = malloc(maxlen * sizeof(char));
        n = readline(fp, buf, maxlen);
        //if we wanted our lines to be _exactly_ as big as the strings they hold, we could do:
        //buf2 = malloc(n * sizeof(char)); // (then lines[i] = buf2;)
        // we could have also done a the computationally expensive task of finding
        // out how long the line is before backing up the pointer and reading it
        // but memory is cheap! so better to just to the `buf2` approach^
        lines[i] = buf;
        i++;
    }

    //int r = readline(fp, buf, maxlen);
    //printf("read %d bytes: %s\n", r, buf);

    return(0);
}
```

2025-11-07
===
```c
#include <stdio.h>
#include <stdlib.h>

typedef struct {
	int wingspan;
	int canfly;
	char *name;
} bird;

int main() {
	bird duck;
	duck.wingspan = 24;
	duck.canfly = 1;
	duck.name = "daffy";
	
	bird *duckB = malloc(sizeof(bird));
	(*duckB).wingspan = 32;
	duckB->wingspan = 32; // equivalent
	
	return 0;
}
```
### Where is duck?
- in C, nothing like objects in python
- all it is is the variables stuck together sequentially (by order of declaration) in memory

(HYPOTHETICAL, ASSUMING INTS AND POINTERS ARE 1 BYTE)
Stack:

| Label         | Address | Value                          |
| ------------- | ------- | ------------------------------ |
| duck.wingspan | 0x3F    | 27                             |
| duck.canfly   | 0x3E    | 1                              |
| duck.name     | 0x3D    | 0x1C (address in data section) |
| duckB         | 0x3C    | 0x26                           |
|               | 0x3B    |                                |
|               | 0x3A    |                                |

Heap:

| Label    | Address | Value |
| -------- | ------- | ----- |
|          | 0x2A    |       |
|          | 0x29    |       |
| name     | 0x28    |       |
| canfly   | 0x27    |       |
| wingspan | 0x26    | 32    |



### Let's create a new file format!
- Just like types, file formats are nothing but figments of our imagination (just made up ways of storing bytes on a disk)
```c
#include <stdio.h>
#include <stdlib.h>

typedef struct {
	int wingspan;
	int canfly;
} bird;

int main() {
	bird duck;
	duck.wingspan = 24;
	duck.canfly = 1;
	FILE *fp = fopen("duck.brd", "wb"); // wb is "write bytes", rb is "read bytes"
	
	// 4 arguments: memory address, how much memory to write, how many times, where to write (file pointer)
	fwrite(&duck, sizeof(duck), 1, fp);
	
	fclose(fp);
	return 0;
}
```
this gives us:
`-rw-rw----+  1 mficco fa25-cse-20289.01    8 Nov 11 16:29 duck.brd`
notice it is 8 bytes! (two ints, each 4 bytes)
```
$ xxd duck.brd
00000000: 1800 0000 0100 0000                      ........
```

- if we put the name back in the struct, writing the struct directly would just give us a 16 byte file including the address of the name in the data segment
- so, we write each variable individually:
```c
#include <stdio.h>
#include <string.h>
#include <stdlib.h>

typedef struct {
    int wingspan;
    int canfly;
    char *name;
    int namelen;
} bird;

int main() {
    bird duck;
    duck.wingspan = 24;
    duck.canfly = 1;
    duck.name = "donald";
    duck.namelen = strlen(duck.name);

    FILE *fp = fopen("duck.brd", "wb");
    fwrite(&duck.wingspan, sizeof(int), 1, fp);
    fwrite(&duck.canfly, sizeof(int), 1, fp);
    fwrite(&duck.namelen, sizeof(int), 1, fp);
    fwrite(duck.name, duck.namelen*sizeof(char), 1, fp);

    fclose(fp);
    return 0;
}
```
this gives us:
```
$ xxd duck.brd
00000000: 1800 0000 0100 0000 0600 0000 646f 6e61  ............dona
00000010: 6c64                                     ld
```

### Function Pointers!
- "Ducks don't just sit there! They do stuff!"
> "So, a lot of times you'll hear people say things like, 'C is not an object-oriented language'. Heard that before? But don't worry, 'Python is an object-oriented language'. You know what? That statement has no meaning! It doesn't mean anything for the language to be object-oriented. What does that even mean? It doesn't mean anything. You write programs in an object-oriented fashion. You write programs in a functional form, or whatever. Okay? But the language itself has nothing to do with whether it's object-oriented or not. Yes, some languages automatically support object-oriented features more easily. I guess that's what they mean when they say it's an object-oriented language, but there's nothing, like...there's no reason that C is not an object-oriented language, really. It's just that you don't know how to write C in an object-oriented way. That's what that means. Try to throw shade on C when it's really your own fault!

- Recall that functions are just bytes in memory (cpu instructions, stored in the code section)
- We can make a pointer point to those bytes! (pointer holds the memory address of the function)
```c
#include <stdio.h>
#include <string.h>
#include <stdlib.h>

typedef struct {
    int wingspan;
    int canfly;
    char *name;
    int namelen;
    void (*noise)(); // "not all birds make the same noise"
} bird;

void chirp() {
    printf("chirp!!!!!!!!!\n");
}

void quack() {
    printf("quack!!!!!!!!!\n");
}

int main() {
    bird duck;
    duck.wingspan = 24;
    duck.canfly = 1;
    duck.name = "daffy";
    quack();

    // we doin't write void *fcn() because it could be confusing
    // () just matches the parameters list
    void (*fcn)() = &quack;

    // we can do all kinds of things now!
    // we invoke (dereference) the function pointer by:
    (*fcn)();

    // we can store it in a struct
    duck.noise = &quack;
    // and then call it just like this!
    duck.noise();

    return 0;
}
```
- We can then pass our duck struct around like an object!  This is essentially object oriented programming!
- Next class we will continue with function pointers (and passing self!!)

2025-11-10
===
Snow Day!


2025-11-12
===
### the "self" is an illusion
```c
#include <stdio.h>
#include <string.h>
#include <stdlib.h>

typedef struct bird bird;

struct bird {
    int wingspan;
    int canfly;
    char *name;
    int namelen;
    void (*noise)(bird *);
} bird;

void chirp(bird *self) {
    printf("chirp!!!!!!!!!\n");
}

void quack(bird *self) {
    printf("quack!!!!!!!!! %s\n", self->name);
}

int main() {
    bird sparrow;
    sparrow.wingspan = 8;
    sparrow.canfly = 1;
    sparrow.name = "sparrow";
    sparrow.noise = &chirp;
    duck.noise();

    return 0;
}
```
- recall, `&chirp` and `&quack` are addresses in the code segment!

Why are function pointers important?
1. we can make proto-object like things in C (see code above)
2. avoids repetitive code for similar operations (see code below)

```c
void arry_op(int *ary, int arylen, int (*fcn)(int))
{
    int i;
    for(i=0; i<arylen; i++)
    {
        ary[i] = (*fcn)(ary[i]);
    }
}

int mult_five(int a)
{
    return(a*5);
}

int sub_six(int a) {
    return(a-6);
}
```
- in codebases you might see functions named `generic` or with `_op`
    - allow for extensibility! users can write functions that are used by library (think writing custom backward function for pytorch)

2025-11-14
===
### What is a segfault anyway?
An error that means you tried to read or write memory that you're not allowed to read or write
- operating system gives you a contiguous block of virtual memory
- metaphor: reserved parking spots
    - you can't park your car in a spot where someone else is already parked!
        - would cause a big issue!
    - you also can't park your car in someone's spot when you're not there!
        - won't cause any physical issues, but technically, is an error!
- NOT ALLOWED; "you have a fault on the memory segment"

### Palindrome Finder
(writing the program with some intentional bugs to find)
```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int is_pal(char *s) {
    char *head = s;
    char *tail = s + strlen(s);

    while(*head == *tail) {
        head++;
        tail--;
    }

    if(head >= tail)
        return 1;

    return 0;
}

int main() {
    char *buf = malloc(24 * sizeof(char));
    fgets(buf, 24, stdin);

    printf("%d\n", is_pal(buf));

    return(0);
}
```
Something's wrong...let's debug!

`gcc -g -o pal pal.c`
- embeds source code in the executable
- actually incurs a small cost to the execution time

we can now use it with gdb!

let's set a break point: `b 7`
then we run the program: `run` (and type in our input to stdin)
to execute next line: `n`
we can print values:
`p *head`
`p *tail`
`p tail`
Now we see our issue! (tail initially points to `\0`)
We also need to "chomp" the `\n` character that is captured by `fgets`

But we're not done...
...if we run `valgrind ./pal` we get a bunch of issues!
- Ok great, let's also add `free` to fix the memory leak:

```c
int is_pal(char *s) {
    char *head = s;
    char *tail = s + strlen(s) - 1; // <---

    while(*head == *tail) {
        head++;
        tail--;

        if(head >= tail) // <---
            break;
    }

    if(head >= tail)
        return 1;

    return 0;
}

void chomp(char *s) { // <---
    if(s[strlen(s)-1] == '\n') {
        s[strlen(s)-1] = '\0';
    }
}

int main() {
    char *buf = malloc(24 * sizeof(char));
    fgets(buf, 24, stdin);

    chomp(buf); // <---

    printf("%d\n", is_pal(buf));

    free(buf); // <---

    return 0;
}
```

But we're still getting a bunch of issues!
- Notice how our code is inefficient, because for palindromes it double checks past the middle
- tail will keep moving down, and head will keep moving down, until they happen upon some value that makes them differ
- Not an issue...until the `tail` runs out of the bottom of the heap!
    - the compiler often puts a little space between the data and heap segments to account for this :)
        - we didn't used to have it like this, but again, memory is cheap nowadays!

errors in valgrind we will see:

"invalid read of size 1"
- tail is pointing to some space out of allocated memory 
    - (head might be too, depending on size of buffer)

"conditional jump or move depends on uninitialized values"
- in our while loop, we are comparing pointers that point to uninitialized values

to fix: we break as soon as head >= tail:
```c
int is_pal(char *s) {
    char *head = s;
    char *tail = s + strlen(s) - 1;

    while(*head == *tail) {
        head++;
        tail--;

        if(head >= tail) // <---
            break;
    }

    if(head >= tail)
        return 1;

    return 0;
}

```

2025-11-17
===
An example of a memory anti-pattern in C:
```c
readline(fp, malloc(...), len);
// not only do we not free the allocated space, we never tracked it to begin with!
```
Another one:
```c
// in a loop to read each line...
	char *buf = malloc(...);
	char *splits[27];
	//...
	dino->name = splits[5];
	//...
	for (int i=0; i<numsplits; i++) {
		free(split[i])	
	}
	// this is wrong; we don't want to free stuff in each dino before we use it!
```
Note that this code would still work! We deallocated the space but the values are still there
- analogy: leave your car parked, until your parking pass expires. The parking spot is no longer allocated to you, but your car is still there!

### Recap: What happens when you run a program
- if I am bash, I ask the OS (kernel) to:
	- create a memory space (copy code from disk)
	- run the program
		- strict rules: code in code segment is only authorized to access memory in its memory space (else segfault!)
	- assign me as the parent process
- You don't "open" a file
	- you go before the kernel and prostrate yourself (jk lol)
	- the kernel will decide if you are allowed to do that process
	- to read/write, you ask and then the kernel does it on your behalf

- to ask the kernel, you use a system call (`syscall`)
- looked at (https://chromium.googlesource.com/chromiumos/docs/+/master/constants/syscalls.md)
```c
#include <fcntl.h>
#incldue <unistd.h>
#include <sys/syscall.h>
#include <sys/types.h>
// notice: no stdio.h! we are going to ask the kernel directly

int main() {
	char buf[24] = "yay notre dame!\n";
	
	int fd;
	
	fd = syscall(SYS_open, "example.txt", O_RDRW);
	
	syscall(SYS_write, fd, &buf, 24);
	
	syscall(SYS_close, fd);
}
```
- We're used to `FILE *fp = fopen();`
- What is a FILE pointer?
- It is just an integer to index into the the "open file table":

| fid | name | path |
| --- | ---- | ---- |
| 0   |      |      |
| 1   |      |      |
| 2   |      |      |
| ... |      |      |

- The program that tells the OS how to access the file is called a driver
- Be aware that when when we use `malloc()`, we are doing a syscall with:
	- brk: moves heap up and gives you back the pointer
	- mmap: more complicated stuff to allocate bigger chunks of memory

- parent process can't run or modify anything within child directly
- instead, it asks the kernel to send a signal to the child
- the child can be configured to execute functions upon receiving a signal

in kernel, there is an ivt (interrupt vector table):

| process | signal | function |
| ------- | ------ | -------- |
| 5000    | 13     | foo()    |

- child process 5000 must ask the kernel to route this signal to the function

2025-11-19
===
final exam topics on C (approx. 70%):
- memory management and program structure
- function pointers
- system calls
- signals/inter-process communication (ipc) <- TODAY!
- multiprocessing + threading
- sockets in C
- language bindings
(remaining 30% on prev. topics not tested)

- Story of Jimmy Bozart and the [Hollow Nickel Case](https://en.wikipedia.org/wiki/Hollow_Nickel_Case)
- Dead drop communication:
    - method of covert communication where two people leave and pick up a message or item from a secret, prearranged location without ever meeting

- We do this between processes!
    - The receiver process asks the kernel to make an entry in the ivt, so that when the signal is sent to the kernel, the kernel runs a specified function 
    - The sender (parent) can then ask kernel to send this signal to the receiver process (so long as they are in same user space)
    - A function runs in the _receiver's_ memory space
    - This function could then read/write data in a file (dead drop), thus enabling communication between processes only by sending signals


`signalrecv.c`
```c
#include <stdio.h>
#include <stdlib.h>
#include <signal.h>

void handle_sig(int sig) {
    printf("got signal %d\n", sig);
    char buf[24];
    FILE *fp = fopen("msg.txt", "r");
    if(fgets(buf, 24, fp) != NULL)
    {
        printf("%s\n", buf);
    }
    fclose(fp);
}

int main() {
    // signal is just a wrapper for a syscall
    signal(SIGUSR1, handle_sig);

    while(1) { }

    return(0);
}
```

- let's run `ps ef` to find the process id
- then we run `kill -10 <PID>` to send this signal (10 aka `SIGUSR1`)
- ...let's write a program to do this for us:

`sendsig.c`
```c
#include <stdio.h>
#include <stdlib.h>
#include <signal.h>
#include <unistd.h>

int main(int argc, char *argv[]) {
    // kill is just a wrapper for a syscall
    kill(1769796, SIGUSR1);

    return(0);
}
```
this doesn't have to be in C! `sendsig.py`:
```python
import os
import signal

pid = 1772661

with open("msg.txt", "w") as fp: # here we write a dead drop message!!
    fp.write("secret!!!")

os.kill(pid, signal.SIGUSR1)
```
The point is, we aren't communicating with the program ourselves. It is through the kernel!

- Note: Dead drop inter-process communication with signals is slow. (have to write and read from disk)

---
in ivt, there are more things that are kept track of (other than process, fig, fcn that we loosely described earlier)
- if you're busy doing something important, and someone calls you, you want to know _who_ is calling you

kernel also keeps track of program/execution context (the things which the program is doing at that particular time)
- because you want to be able to return to your task easily after being interrupted!

`signalrecv2.c`
```c
// context is important for threading, knowing which thread to pick back up
#include <stdio.h>
#include <stdlib.h>
#include <signal.h>

void handle_sigusr1(int sig, siginfo_t *siginfo, void *context) {
    printf("got signal %d from pid %d from uid %d\n", sig, siginfo->si_pid, siginfo->si_uid);

    char buf[24];
    FILE *fp = fopen("msg.txt", "r");

    if (fgets(buf, 24, fp) != NULL) {
        printf("%s\n", buf);
    }

    fclose(fp);
}

int main() {
    struct sigaction act1;
        act1.sa_sigaction = &handle_sigusr1;
        act1.sa_flags = SA_SIGINFO;

    sigaction(SIGUSR1, &act1, NULL);

    while(1) { }

    return(0);
}
```

2025-11-21
===
Today we will be covering threads! Real threads! (Not those phony Python/Ray threads which are actually super-heavy-duty processes that communicate via super-heavy-duty sockets.)

### first: what exactly is a void pointer?
```c
int main() {
    int x = 42;
    int *p = &x;
    p++; // adds to the pointer the size of the type of the value to which it points!

    // But...if you have to deal with contiguous blocks of memory whose size you don't know:
    void *p2 = &x;
    // Now, this is NOT ALLOWED:
    p2++;
    // To use a void pointer, we must first cast it, and then dereference:
    int y = *(int *)p2;

    // interestingly, we can create and array of void pointers! (same size of any other pointer)
    void *ary[6];
    ary[0] = &x;
    long l = 9182374;
    ary[1] = &l;
}
```

### What is a thread?
- It is a new stack! We just "stack" them on the top :)
- all part of the same memory segment (they all share the same heap, data, and code sections)
```
 (etc)
------------
| STACK t1 |
-----v------ <- our new thread!
|          |
------------
| STACK t0 |
-----v------
|          |
|          |
-----^------
|   HEAP   |
------------
|   DATA   |
------------
|   CODE   |
------------
```
- remember that these are virtual address spaces, so the stacks might not literally be right on top of each other. The kernel handles all that for us.
- our program can't just make new stacks...we must ask the kernel through system calls! 

```c
#include <stdio.h>
#include <stdlib.h>
#include <limits.h>
#include <pthread.h>

#define NT 4

typedef struct {
    int tn;
} threadarg;

int rets[NT];

void * threadfcn(void *varg) {
    threadarg *arg = (threadarg *) varg;

    printf("in threadfcn %d\n", arg->tn);

    int i = 0;
    for(int j=0; j<INT_MAX; j++) i++;

    rets[arg->tn] = i;
}

int main() {
    int i;

    pthread_t tid[NT];
    threadarg targs[NT];

    for(i=0; i<NT; i++)
        targs[i].tn = i;

    for(i=0; i<NT; i++) {
        // pthread_create is a wrapper for a bunch of syscalls
        pthread_create(&tid[i], NULL, threadfcn, (void *) &targs[i]);
    }

    for(i=0; i<NT; i++) {
        pthread_join(tid[i], NULL);
        printf("thread %d returned %d\n", i, rets[i]);
    }

    return(0);
}
```
- why `void *`?
    - Thread start routines use `void *` so they can accept and return a pointer to any type of data
    - this lets us pass arbitrary arguments and results between threads.

- we do not have control over the order in which the threads are run!

- the threads are running in a completely different stack!  How are we going to return anything?!
    - to return anything from stack to stack, we would need help from the kernel
- Or...we need to have a common space that each thread can access
- We create a global that lives in the data segment!
    - one of the few appropriate uses of globals in C!
- How do we avoid concurrency problems?  We will just give each thread a unique space to write to :)
    - otherwise we need lock mechanisms, etc. to deal with concurrency problems (will see later in Operating Systems!)

### gdb with threads
- we can still use gdb!
1. set a breakpoint in the thread function
2. `info threads` to see our threads (thread 1 is main)
3. `run`: gdb will stop us at breakpoint in first thread
4. `finish` to let that thread return
5. `continue` to move on and stop in the next thread at the same breakpoint


2025-11-24
===
- Mysterious numbers being transmitted over radio
- Where were they from?  The British Royal Air Force on the southern tip of Cyprus!
- Meant to transmit signals to British spies in Soviet Union
- Claude Shannon, Manhattan Project
- Encoding images in sound

### 4 reasons we want to use C
- others use it! (need to use libraries, etc.) - m3a
- file formats! (have easy access to bytes and bits, file system, etc.) - m3b
- fast! (crucial for some niche applications) - m3c
- device drivers! (interface between hardware device and kernel) - m3d

> Described milestone assignments (m3c, m3d)

- Talked about Russian illegals program :)


2025-12-01
===
### Recall:
```
------------
| STACK t1 |
-----v------ <- our new thread!
|          |
------------
| STACK t0 |
-----v------
|          |
|          |
-----^------
|   HEAP   |
------------
|   DATA   |
------------
|   CODE   |
------------
```
- in order to create new thread, we must ask the kernel via a system call
- kernel adds it to the top
- two advantages:
    - really quick: all the kernel has to do is allocate more memory
    - simplifies data access: t1 can access the same heap, data, and code sections
- `pthread_create(...)` is a wrapper for this system call to kernel
    - recall that all that we had to do was modify an array `rets` in the data segment (being careful to ensure no overwriting occurs)

- In our example from two classes ago, the memory for `rets` was trivial (4 ints)
    - simplest way to return from threads; common bc memory is cheap
- But what if we were extremely constrained in memory, or had a lot of data to return?
    - we would need to control access so multiple threads don't write at same time (concurrency/race condition)

Threads being able to access the same memory space is a double edged sword:
- it is great to be able to write/read very easily/quickly to the same data, but...
- ...what happens if thread t1 crashes?
    - the problem is not contained!  It could affect other threads and crash the whole program!
- ...what if we don't trust the thread?

we want to isolate t1 and t0.
instead of threading, we want...

### ...Multiprocessing!
Instead of asking the kernel to make a new thread stack, we can ask it to clone our memory space!
- this is a whole new process, with its own stack, heap, data, and code segments
- called `fork()`

when we call fork, it makes an identical copy. That includes the stack! The function that is currently running is in the stack!
So all that stuff, the chain of function invocations, is also duplicated.
That means that the clone wakes up, and it just starts executing, right? It doesn't know the difference.
But the clone doesn't know any better, becuase it has the same memories!

Only one way to find out which one is the parent, and which one is the child:
- the kernel will return the child's process id to the parent (stored in cpid)
- but when the child runs `fork()` in its stack frame, the kernel will return 0!
```c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/wait.h>

int main() {
    int pid = getpid();
    printf("my pid: %d\n", pid);

    int cpid = fork();

    // what would we happen if we did:
    //
    // for (int i=0; i<100; i++) cpid = fork();
    //
    // "fork bomb"!

    if(cpid == 0) {
        // I am the child / clone
        printf("help help I just realized I am the clone!!??\n");

        return 0;
    } else {
        // I am the parent / original
        printf("child pid: %d\n", cpid);

        // collect return value of child
        int r = wait(NULL); // if we didn't have this, we would notice our child become a zombie!

        while(1) { }
    }

    return 0;
}
```

Let's go and modify our previous thread program to use `fork` instead of `pthread_create`:
```c
#include <stdio.h>
#include <stdlib.h>
#include <limits.h>
#include <pthread.h>
#include <unistd.h>
#include <sys/wait.h>

#define NT 4

typedef struct {
    int tn;
} threadarg;

// int rets[NT];

void * threadfcn(void *varg) {
    threadarg *arg = (threadarg *) varg;

    printf("in threadfcn %d\n", arg->tn);

    int i = 0;
    int j;
    for(j=0; j<INT_MAX; j++)
        i++;

    //rets[arg->tn] = i;
    // ^we can't do this!!
    // each child process has a different data segment!!!
    // the only way that we can share data is through a shared location like a temporary file on disk

    char *fn = malloc(128 * sizeof(char));
    sprintf(fn, "tmp_%d.bin", getpid());
    FILE *fp = fopen(fn, "wb");
    fwrite(&i, sizeof(int), 1, fp);
    fclose(fp);
    free(fn);
}

int main() {
    int i;
    int r;
    int cpid;
    int wres;

    //pthread_t tid[NT];
    threadarg targs[NT];

    for(i=0; i<NT; i++)
        targs[i].tn = i;

    for(i=0; i<NT; i++) {
        cpid = fork();
        if(cpid == 0) {
            // "Oh! I'm the clone, so I must go do work!"
            threadfcn((void *) &targs[i]);
            return 0; // VERY IMPORTANT TO RETURN IMMEDIATELY AFTER!
        }
        //pthread_create(&tid[i], NULL, threadfcn, (void *) &targs[i]);
    }

    for(i=0; i<NT; i++) {
        // order varies, unlike pthread_join where we wait on a specific thread id
        // (just whichever child process happens to finish)
        wres = wait(NULL); // becuase we pass NULL, wres will get cpid

        char *fn = malloc(128 * sizeof(char));
        sprintf(fn, "tmp_%d.bin", wres);
        FILE *fp = fopen(fn, "rb");
        fread(&r, sizeof(int), 1, fp);
        fclose(fp);
        remove(fn); // delete file
        free(fn);

        //pthread_join(tid[i], NULL);
        //printf("child %d returned %d\n", i, rets[i]);
        printf("child %d returned %d\n", i, r);
    }

    return(0);
}
```
- closing demo: multiprocessing with `fork` is way slower than multithreading!!
- when is the cost in time worth it? see next class...


2025-12-03
===
### ipv4 tcp internet socket
- two computers (different kernels, running different processes) want to communicate with each other.
- they can't just spontaneously
- 65k port numbers on each computer as entrypoints from the network 

- process goes to kernel and says, "I would like to make myself available to recieve a connection"
- kernel creates a socket, and gives back socket id number to process
- that socket is assigned to a specific port number

- the process then `bind()`s and `listen()`s to the socket
- any data that goes through the specified port is routed to the process

- the kernel knows it is student10, but the network over which it communicates does not
    - connections are routed via ip addresses!
- DNS keeps a table of hosts and ip addresses

kernel has "sockaddress_in" data structure contains ip address and hostname (asks DNS and comes back)

- both client and server have a port number!

### Let's start in python:
recall our `client.py` program we wrote earlier:
```python
import socket

HOST = "student10.cse.nd.edu"  # Server IP (localhost for testing)
PORT = 9999        # Must match the server’s port

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    s.connect((HOST, PORT))
    message = "Hello, MD! Oct.1 2025 - from systems programming class"
    s.sendall(message.encode())
    print(f"Sent: {message}")
    gotmesg = s.recv(1024)
    print(gotmesg.decode())
```

### Now in C:
```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <math.h>
#include <limits.h>
#include <errno.h>
#include <sys/wait.h>
#include <signal.h>
#include <netdb.h>
#include <netinet/in.h>

void print_banner(int sockfd)
{
    int n;
    int buflen = 2048;
    char buf[buflen];

    memset(buf, 0, buflen);
    n = read(sockfd, buf, buflen-1);

    if(n < 0)
    {
        perror("could not read");
        exit(1);
    }

    printf("recv: %s\n", buf);

    //memset(buf, 0, buflen);
    //sprintf(buf, "hi!");
    n = write(sockfd, buf, strlen(buf));

    if(n < 0)
    {
        perror("could not write");
        exit(1);
    }
}

int main(int argc, char *argv[])
{
    int sockfd, portno, n;
    struct sockaddr_in serv_addr;
    struct hostent *server;

    int buflen = 32;
    char buf[buflen];

    portno = atoi(argv[2]);
    server = gethostbyname(argv[1]);

    sockfd = socket(AF_INET, SOCK_STREAM, 0);

    if(sockfd < 0)
    {
        perror("could not create the socket");
        exit(1);
    }

    bzero((char *) &serv_addr, sizeof(serv_addr));
    serv_addr.sin_family = AF_INET;
    bcopy((char *)server->h_addr, (char *)&serv_addr.sin_addr.s_addr, server->h_length);
    serv_addr.sin_port = htons(portno);

    if(connect(sockfd, (struct sockaddr*)&serv_addr, sizeof(serv_addr)) < 0)
    {
        perror("socket could not connect");
        exit(1);
    }

    // do something with socket
    print_banner(sockfd);

    close(sockfd);

    return 0;
}
```

2025-12-05
===
> A class like Data Structures looks inward. Systems Programming (this class) looks outward

Last time we were talking about client-side sockets in C
- A socket is just "my end" of a network connection
- A network connection is like a telephone call
- The access points are the ports and sockets
- Remember, "each side of a telephone call must have a phone"!
- each socket has a port number and an ip address

So, last time we were talking about "dialing"

Today we will look at server-side!
**Bind, Listen, Accept**
```c
#include <errno.h>
#include <sys/wait.h>
#include <signal.h>
#include <netdb.h>
#include <netinet/in.h>
#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <unistd.h>

void handle_incoming_conn(int cl)
{
    int buflen = 256;
    int rc;
    char *buf = malloc(buflen * sizeof(char));
    memset(buf, 0, buflen);

    while((rc = read(cl, buf, buflen-1)) > 0)
    {
        printf("read %d bytes: %s\n", rc, buf);
        memset(buf, 0, buflen);
    }

    free(buf);

    close(cl);
}

void handle_sigchld(int sig)
{
    wait(NULL);
}

int main()
{
    int sock, port, t, cl, cpid;

    sock = socket(AF_INET, SOCK_STREAM, 0);

    port = 8003;

    signal(SIGCHLD, &handle_sigchld);

    struct sockaddr_in addr;
    addr.sin_family = AF_INET;
    addr.sin_addr.s_addr = INADDR_ANY;
    addr.sin_port = htons(port);

    t = bind(sock, (struct sockaddr *) &addr, sizeof(addr));

    if(t < 0)
    {
        perror("could not bind");
        return -1;
    }

    listen(sock, 5);

    while(1)
    {
        cl = accept(sock, NULL, NULL);

        cpid = fork();

        if(cpid == 0)
        {
            handle_incoming_conn(cl);
            return 0;
        } else
        {
            close(cl);
        }
    }

    close(sock);

    return 0;
}
```
- remember when we did this in python? remember that when we "pick up the phone", a new phone materializes!
- i.e, upon accepting, the kernel creates a new socket through which we handle the incoming connection

- But...(like in python) we have an issue: our program is a single-threaded process, so we can only handle one connection at a time
- We could create a new thread, but we don't want to do this!!!
    - if one connection causes the program to crash, everyone
- Example scenario: everyone in the classroom connects, and it's a multithreaded client socket program
    - Every thread will share the same data and heap
    - If we have a malicious user who gains control over their stack, they could access sensitive information in the heap
- We need to use multiprocessing instead of multithreading (need to use `fork` instead of `p_thread`)!
- both parent and child will close connection to socket independently!

- we can use `telnet` to open a TCP connection and type bytes back and forth

- We have another issue!

`SIGCHLD` - whenever a child stops or is terminated, the kernel will send this signal to the parent
- "remember to clean up your zombie children" :)


2025-12-08
===
> [Lótus Bridge](https://en.wikipedia.org/wiki/L%C3%B3tus_Bridge)
> on one side of the bridge, people drive on the left, and on the other, they drive on the right!

- C is great for many things!  For example, device drivers!  But say we needed to write a driver, but don't want to write our whole program in C!
concept: language binding (the glue/interface that will connect the worlds of different languages, like the Lotus bridge)

libgeodist.c: (pretend this is a complicated c program to interface with a device or parallelize lots of things)
```c
#include <math.h>
#include <string.h>

#include "libgeodist.h"

#define pi 3.14159265358979323846

double deg2rad(double deg) { return (deg * pi / 180); }
double rad2deg(double rad) { return (rad * 180 / pi); }

double geodist(double lat1, double lon1, double lat2, double lon2) {
    double theta, dist;
    if ((lat1 == lat2) && (lon1 == lon2)) {
        return 0;
    } else {
        theta = lon1 - lon2;
        dist = sin(deg2rad(lat1)) * sin(deg2rad(lat2)) + cos(deg2rad(lat1)) * cos(deg2rad(lat2)) *    cos(deg2rad(theta));
        dist = acos(dist);
        dist = rad2deg(dist);
        dist = dist * 60 * 1.1515;
        return (dist);
    }
}

int palindrome(char *s) {
    char *head = s;
    char *tail = s + strlen(s) - 1;

    while(head < tail && *head == *tail) {
        head++;
        tail--;
    }

    if(head >= tail)
        return 1;

    return 0;
}
```
- marshalling - converting data from one format to another (different from casting, which may be a lossy conversion - e.g. float to int)

- This is how libraries like numpy or pytorch can do things really fast in python (with small fixed cost to marshall data)

- Hey! palindrome has pointers! How do we interface with it in python?
    - Just like the other variables, there is a char pointer ctype!

> anecdote about living in germany and saying a hyperbole -- translated correctly, but not appreciated in cultural context
- we also need to marshall data in a "cultural" manner - it's not very pythonic to return 1/0 for true/false

cgeodist.py:
```python
import pathlib
import ctypes

class cgeodist:
    def __init__(self):
        self.libname = pathlib.Path().absolute() / "libgeodist.so"
        self.c_lib = ctypes.CDLL(self.libname)

    def geodist(self, lat1, lng1, lat2, lng2):
        lat1 = ctypes.c_double(lat1)
        lng1 = ctypes.c_double(lng1)
        lat2 = ctypes.c_double(lat2)
        lng2 = ctypes.c_double(lng2)

        self.c_lib.geodist.restype = ctypes.c_double
        ret = self.c_lib.geodist(lat1, lng1, lat2, lng2)
        return ret

    def palindrome(self, word):
        word = word.encode('utf-8')
        word = ctypes.c_char_p(word)

        self.c_lib.palindrome.restype = ctypes.c_int
        ret = self.c_lib.palindrome(word)

        if(ret == 1):
            ret = True
        else:
            ret = False

        return ret
```

now we can use our c library as a python library!
```python
from cgeodist import *

gd = cgeodist()

dist = gd.geodist(41.643274, -86.382732, 52.382344, 11.348448)
print(dist)

p = gd.palindrome("civic")
print(p)
```

Why would we use language bindings? If you have to access another language for something:
1. Special file format
2. Device driver
3. Speed (parallelization, access to gpu, etc.)

"marshalling is the thing that you do to connect, technically and culturally, one language's parts to another."

2025-12-10
===
Final Exam Review
[CSE20289 Final Exam Practice](CSE20289FinalExamPractice.pdf)

