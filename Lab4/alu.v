module ALU(
    input [31:0] SrcA,
    input [31:0] SrcB,
    input [2:0] alucontrol,
    output reg [31:0] aluout,
    output zero
    );
    
    always @(*) begin
        case (alucontrol)
        3'b000: aluout = SrcA & SrcB;
        3'b001: aluout = SrcB | SrcA;
        3'b010: aluout = SrcA + SrcB;
        3'b110: aluout = SrcA - SrcB;
        3'b111: aluout = (SrcA < SrcB) ? 32'b1 : 32'b0;
        default: aluout = 32'b0;
        endcase
    end
    
    assign zero = (aluout == 32'd0);
endmodule
