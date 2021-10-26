/*
 * Filename: ascii_triangle.c
 * Author:   simshadows <simshadows.com>
 *
 * The program prints an ASCII right-angled triangle.
 * Height is taken from user input.
 *
 * Output must look like the following example:
 * 
 *    #
 *   ##
 *  ###
 * ####
 *
 * The example above has a height of 4.
 * Take note of the orientation of the triangle.
 *
 */

#include <stdio.h>

void print_triangle(int height) {
    for (int row = 1; row <= height; ++row) {
        for (int i = 0; i < height - row; ++i) printf(" ");
        for (int i = 0; i < row; ++i) printf("#");
        printf("\n");
    }
}

int main() {
    int height = 0;
    
    do {
        printf("Please input the height: ");
        scanf("%d", &height);
    } while (height < 1 || height > 100);
    // Arbitrary limit of 100. Just change that as needed.
    
    print_triangle(height);
}

