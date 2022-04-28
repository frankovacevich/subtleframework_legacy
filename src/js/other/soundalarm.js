Subtle.SoundAlarm = class SoundAlarm{
  constructor(file, parameters){
    this.params = {
      loop: true,
    }
    for(const p in parameters){ this.params[p] = parameters[p]; }

    this.file = file;
    this.audio = new Audio(file);

    this.is_playing = false;
  }

  play(){
    if(!this.is_playing){
      this.audio.play();
      this.is_playing = true;
    }
  }

  stop(){
    audio.stop();
    if(this.is_playing){
      this.audio.stop();
      this.is_playing = true;
    }
  }

}
