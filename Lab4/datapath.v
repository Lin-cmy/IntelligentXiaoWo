module datapath(
    input clk, 
    input rst,
    input jump,
    input branch,
    input alusrc,
    input memtoreg,
    input regwrite,
    input regdst,
    input [2:0] alucontrol,
    input [31:0] instr,
    input [31:0] readdata,
    output [31:0] aluout,
    output [31:0] pc,
    output [31:0] writedata
    );
    
    wire [31:0] pcnext;
    wire [31:0] pcplus4;
    wire [31:0] pcbranch;
    wire [31:0] signimm;
    wire [31:0] signimmsh;
    wire [31:0] SrcA;
    wire [31:0] SrcB;
    wire [4:0] writereg;
    wire [31:0] result;
    wire zero;
    wire pcsrc;
    
    // 计算跳转目标地址（j 指令）
    wire [31:0] jump_target = {pcplus4[31:28], instr[25:0], 2'b00};

    // PC来源选择
    assign pcnext = jump ? jump_target :          // 跳转指令
                    pcsrc ? pcbranch :            // 分支指令
                    pcplus4;                      // 顺序执行
    
    // pc模块
    pc pc_module (.clk(clk),.rst(rst),.pcnext(pcnext),.pc(pc));
    
    // ALU模块
    assign SrcB = alusrc ? signimm : writedata;
    ALU ALU_module (.SrcA(SrcA),.SrcB(SrcB),.alucontrol(alucontrol),.aluout(aluout),.zero(zero));
    
    // sl2模块
    sl2 sl2_module (.a(signimm),.y(signimmsh));
    
    // signext模块
    signext signext_module (.a(instr[15:0]),.y(signimm));
    
    // regfile模块
    assign writereg = regdst ? instr[15:11] : instr[20:16];
    assign result = memtoreg ? readdata : aluout;
    regfile regfile_module (.clk(clk),
                            .ra1(instr[25:21]),
                            .ra2(instr[20:16]),
                            .wa3(writereg),
                            .wd3(result),
                            .we3(regwrite),
                            .rd1(SrcA),
                            .rd2(writedata));
                            
    // 加法器模块
    adder adder_module1 (.a(pc),.b(32'h04),.y(pcplus4));
    adder adder_module2 (.a(signimmsh),.b(pcplus4),.y(pcbranch));
    
    assign pcsrc = branch & zero;
    
endmodule
