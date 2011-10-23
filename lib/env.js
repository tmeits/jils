module.exports = env;

function env(defs,outer){ 
    this.outer = outer;
    this.scope = defs;
    this.find = function(def){
        if (def in this.scope) return this.scope;
        else if (this.outer && this.outer.find){
            return this.outer.find(def);
        } else return this.scope;
    }; return this;
}
