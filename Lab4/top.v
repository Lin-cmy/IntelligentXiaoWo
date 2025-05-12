module top(
	input clk,
	input rst
    );
	wire[31:0] pc,instr,readdata,aluout,writedata;
   	wire data_ram_wea;
   	
	mips mips(
	.clk(clk),
	.rst(rst),
	.pc(pc),
	.instr(instr),
	.memwrite(data_ram_wea),
	.aluout(aluout),
	.writedata(writedata),
	.readdata(readdata)
	);
	
	inst_ram instr_ram (
    .clka(clk),
    .addra(pc[31:2]),
    .douta(instr)
    );
    
    data_ram data_ram (
    .clka(clk),
    .wea({4{data_ram_wea}}),
    .addra(aluout[31:2]),
    .dina(writedata),    
    .douta(readdata)
     );
endmodule
