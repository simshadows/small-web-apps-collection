#include <stdio.h>
#include <stdlib.h>
int r,c,h;
int main(int X,char **a){h=atoi(a[1]);for(;r<h;++r){for(c=0;c<h;++c)printf(r+c+2>h?"#":" ");printf("\n");}}