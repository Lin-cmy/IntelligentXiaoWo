module controller(
    input [5:0] op, funct,
    output regwrite, regdst, alusrc, branch, memwrite, memtoreg, jump,
    output [2:0] alucontrol
    );
    
    // maindec模块
    wire [1:0] aluop;
    maindec maindec_module(.op(op),.regwrite(regwrite),.regdst(regdst),.alusrc(alusrc),.branch(branch),
                           .memwrite(memwrite),.memtoreg(memtoreg),.jump(jump),.aluop(aluop));
                           
    // aludec模块
    aludec aludec_module(.aluop(aluop),.funct(funct),.alucontrol(alucontrol));
    
endmodule
