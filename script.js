let canvas = document.getElementById('canv');
let ctx = canvas.getContext("2d");

console.log(ctx);

function UException(message) {
    this.message = message;
    this.name = "some exception";
 }

function isLetter(char) {
    return char.toLowerCase() != char.toUpperCase()
}

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

class Result {
    constructor(acc = undefined, rest = undefined) {
        this.acc = acc;
        this.rest = rest;
        console.warn('Used RESULT constructor');
    }
}

class MatchParser {
    constructor () {
        this.variables = new Map();
        console.warn('Used VARIABLES constructor');
    }

    setVariable(variableName, variableValue) {
        this.variables.set(variableName, variableValue);
        console.log(this.variables);
    }

    getVariable(variableName) {
        console.warn('Called getVariable()');

        if (this.variables.has(variableName) == false) {
            console.error(`Error: Trying to get undefined variable ${variableName}`);
            return 0.0;
        }

        console.log(this.variables.get(variableName));

        return this.variables.get(variableName);
    }

    Parse(str) {
        console.warn('Called Parse()');

        let result = this.PlusMinus(str);

        if (result.rest != undefined && result.rest.length > 0) {
            console.error('Error: Can not fully parse the expression');
            console.log(`rest: ${result.rest}`);
        }

        return result.acc;
    }

    PlusMinus(str) {
        console.warn('Called PlusMinus()');

        let current = this.MulDiv(str);
        let acc = current.acc;

        while (current.rest.length > 0 && current.rest.length != undefined) {
            if (!(current.rest[0] == '+' || current.rest[0] == '-'))
                break; 

            let sign = current.rest[0];
            let next = current.rest.slice(1);

            current = this.MulDiv(next);

            if (sign == '+')
                acc += current.acc;
            else 
                acc -= current.acc;
        }

        return new Result(acc, current.rest);
    }

    Bracket(str) {
        console.warn('Called Bracket()');

        let zeroChar = str[0];

        if (zeroChar == '(') {
            let r = this.PlusMinus(str.slice(1));
            if (r.rest != undefined && r.rest[0] == ')') 
                r.rest = r.rest.slice(1);
            else
                console.error('Error: Brackets are not closed');
            return r;
        }
        return this.FunctionVariable(str);
    }

    Num(str) {
        let i = 0;
        let dot_cnt = 0;
        let negative = false;
        let s = str;
        // ???????????? ???????????? - ??????????
        if (str[0] == '-') {
            negative = true;
            s = str.slice(1);
        }
        // ?????????????????? ???????????? ?????????? ?? ?????????? 
        while (i < s.length && (!isNaN(s[i]) || s[i] == '.')) {
            if (s[i] == '.' && ++dot_cnt > 1) 
                throw new UException(`Invalid number ${s.slice(0, i + 1)}`);
            i++;
        }
        // ???????????? ???????????????? ???? ?????????? ?????????????? ???? ????????
        if (i == 0) 
            throw new UException(`Can't get a valid number + ${s}`);

        /* ?????????? ???????????????????? ?????????? ???? ?????? ?????????????????? ??????????????????, ???????? ??????, ???? ?????????????? i + 1 */
        let dPart = Number(s.slice(0, i)); 

        if (negative) 
            dPart = -dPart;
        /* ?????????? ???? ???? ?????????? */
        let restPart = s.slice(i);

        return new Result(dPart, restPart);
    }

    FunctionVariable(str) {
        let f = "";
        let i = 0; 

        // ?????????? ???????????????? ?????????????? ?????? ???????????????????? 
        // ?????? ???????????? ???????????????????? ?? ??????????

        console.log(!isNaN(str[i]));

        while (i < str.length && ( isLetter(str[i]) || (!isNaN(str[i]) && i > 0 ))) {
            f += str[i];
            i++;
        }

        if (f.length > 0) { // ???????? ??????-???????? ???????? ??????????????
            if (str.length > i && str[i] == '(') { // ?????????????????? ???????????? - ???????????? - ?????????? ??????????????
                let r = this.Bracket(str.slice(f.length));  
                return this.processFunction(f, r);
            }
            else {
                return new Result(this.getVariable(f), str.slice(f.length));
            }   
        }
        return this.Num(str);
    }

    MulDiv(str) {
        console.warn('Called MulDiv()');

        let current = this.Bracket(str);

        let acc = current.acc;

        while (true) {
            if (current.rest.length == 0)
                return current;

            let sign = current.rest[0];
            
            if (sign != '*' && sign != '/') 
                return current; 

            let next = current.rest.slice(1);
            let right = this.Bracket(next);

            if (sign == '*') 
                acc *= right.acc;
            else 
                acc /= right.acc;

            current = new Result(acc, right.rest);
        }        
    }

    processFunction(func, r) {
        switch (func) {
            case "sin":
                return new Result(Math.sin(toRadians(r.acc)), r.rest);

            case "cos":
                return new Result(Math.cos(toRadians(r.acc)), r.rest);

            case "tg":
                return new Result(Math.tag(toRadians(r.acc)), r.rest);

            case "ctg": 
                return new Result(Math.tag(toRadians(r.acc)), r.rest);

            default: 
                return r;
        }
    }
}

debugger;

let parser_ = new MatchParser();
let formulas = ["2+2*2", "5+9*15", "2+X*2", "sin(90)+4-cos(0)", "2--4", "2**3*5-----7", "3.5.6-2"];
    parser_.setVariable("X", 2.0);

for (let i = 0; i < formulas.length; i++) {
    try {
        console.log(`${formulas[i]} = ${parser_.Parse(formulas[i])}`);
    } catch (e) {
        console.error(`Error while parsing '${formulas[i]}' with message: ${e.message}`);    
    }
}