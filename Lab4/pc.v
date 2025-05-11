module pc(
    input clk,
    input rst,
    input [31:0] pcnext,
    output reg [31:0] pc
    );
    
    always @(posedge clk or posedge rst) begin
        if (rst) begin
            pc <= 32'h00;
        end else begin
            pc <= pcnext;
        end
    end
endmodule
