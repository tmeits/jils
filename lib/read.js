module.exports = read;

function read(tokens){
    if (!tokens.push){
        return tokens;
    } else if (tokens.length){
        var token = tokens.shift();
        if (token === '('){
            var list = [];
            while (tokens[0] !== ')'){
                list.push(read(tokens));
            } tokens.shift();
            return list;
        } else if (token !== ')') {
            return type(token);
        }
    }
}

function type(it){
    var number = Number(it);
    if (!isNaN(number)) return number;
    try {
        return eval(it);
    } catch(e) {
        return it;
    }
}
