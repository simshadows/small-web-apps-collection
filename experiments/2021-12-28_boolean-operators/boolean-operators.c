#include <stdio.h>

int main() {
   int a = 0b101101;
   int b = 0b010010;
   int c = 0;
   int d = -1;

   printf("a = %x\n", a);
   printf("b = %x\n", b);
   printf("c = %x\n", c);
   printf("d = %x\n", d);

   printf("a || a = %x\n", a || a);
   printf("a || b = %x\n", a || b);
   printf("a || c = %x\n", a || c);
   printf("a || d = %x\n", a || d);

   printf("c || a = %x\n", c || a);
   printf("c || b = %x\n", c || b);
   printf("c || c = %x\n", c || c);
   printf("c || d = %x\n", c || d);

   return 0;
}
