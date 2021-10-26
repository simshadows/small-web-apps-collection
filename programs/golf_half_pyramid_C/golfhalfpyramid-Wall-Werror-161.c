#include <stdio.h>
#include <stdlib.h>
int main(int X,char **a){int h=atoi(a[1]);for(int r=1;r<=h;++r){for(int c=1;c<=h;++c)printf(r+c>h?"#":" ");printf("\n");}}