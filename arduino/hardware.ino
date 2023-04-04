#include <Keypad.h>

const byte ROWS = 4;
const byte COLS = 3;

char hexaKeys[ROWS][COLS] = {
  {'1', '2', '3'},
  {'4', '5', '6'},
  {'7', '8', '9'},
  {'*', '0', '#'}
};

byte rowPins[ROWS] = {2, 8, 7, 6};
byte colPins[COLS] = {5, 4, 3};

Keypad keypad = Keypad(makeKeymap(hexaKeys), rowPins, colPins, ROWS, COLS);

const int HOOKOUT = 12;
const int HOOKSENSE = 11;
const int FLASH = 10;
const int REC = 9;

int serialInput = 0;
bool hookState = false; // true = hooked

void setup() {
  Serial.begin(9600);
  pinMode(HOOKOUT, OUTPUT);
  pinMode(HOOKSENSE, INPUT_PULLUP);
  digitalWrite(HOOKOUT, LOW);
  pinMode(FLASH, OUTPUT);
  digitalWrite(FLASH, LOW); 
  pinMode(REC, OUTPUT);
  digitalWrite(REC, LOW); 
  keypad.addEventListener(keypadEvent); // Add an event listener for this keypad
}

void loop() {
  char key = keypad.getKey();
  int state = digitalRead(HOOKSENSE);
  if (state != hookState) {
    Serial.println(state ? "unhook" : "hook");
    hookState = state;
  }
  
  if (Serial.available() > 0) {
    serialInput = Serial.read();
    if (serialInput == 102) { // pass "f"
      digitalWrite(FLASH, HIGH);
    }
    if (serialInput == 100) { // pass "d" (for dark)
      digitalWrite(FLASH, LOW); 
    }
    if (serialInput == 114) { // pass "r" (for RECORD)
      digitalWrite(REC, HIGH); 
    }
    if (serialInput == 115) { // pass "s" (for STOP)
      digitalWrite(REC, LOW); 
    }
  }
  
  delay(10);
}

// Taking care of some special events.
void keypadEvent(KeypadEvent key){
  switch (keypad.getState()){
  case PRESSED:
    Serial.print("pressed ");
    Serial.println(key);
    break;

  case RELEASED:
    Serial.print("released ");
    Serial.println(key);
    break;

  case HOLD:
    Serial.print("held ");
    Serial.println(key);
    break;
  }
}