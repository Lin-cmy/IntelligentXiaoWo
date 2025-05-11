module mips(
	input clk,rst,
	input wire[31:0] instr,
	input wire[31:0] readdata,
	output wire memwrite,
	output wire[31:0] pc,aluout,writedata
    );
    
	wire memtoreg,alusrc,regdst,regwrite,jump,pcsrc,branch;
	wire[2:0] alucontrol;

    controller controller_module(.op(instr[31:26]),.funct(instr[5:0]),.regwrite(regwrite),.regdst(regdst),
                                 .alusrc(alusrc),.branch(branch),.memwrite(memwrite),.memtoreg(memtoreg),
                                 .jump(jump),.alucontrol(alucontrol));
	datapath datapath_module(
	.clk(clk),
	.rst(rst),
	.jump(jump),
	.branch(branch),
	.alusrc(alusrc),
	.memtoreg(memtoreg),
	.regwrite(regwrite),
	.regdst(regdst),
    .alucontrol(alucontrol),
    .aluout(aluout),
    .pc(pc),
    .writedata(writedata),
    .instr(instr),
    .readdata(readdata)
	);
	
endmodule
