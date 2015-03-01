var DStar = function(start){
    this.s_start = start;
};
DStar.prototype = {
    constructor: DStar,
    calcKey: function (s) {
        return [min(g(s), rhs(s))+h(s_start, s)+k_m, min(g(s), rhs(s))];
    },
    init: function () {
        U={};
        k_m = 0;
        for(s of S){
            rhs(s)=g(s)=Number.POSITIVE_INFINITY;
        }
        U.insert(s_goal, this.calcKey(s_goal));
    },
    updateVertex: function (u) {
        if(u != s_goal){
            rhs(u) = min(c(u, sPrim)+g(sPrim)), sPrim of Succ(u);
        }
        if(u in U){
            U.remove(u);
        }
        if(g(u) != rhs(u)){
            U.insert(u, this.calcKey(u));
        }
    },
    computeShortestPath: function () {

    },
    main: function () {
        this.s_last = this.s_start;
        this.init();
    }
};
var x = new DStar();