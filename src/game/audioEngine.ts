export class AudioEngine {
  private ctx: AudioContext | null = null
  private ambientGain: GainNode | null = null
  private ambientOsc: OscillatorNode | null = null
  private kickTimeoutId: ReturnType<typeof setTimeout> | null = null
  private running = false

  public onKick: (() => void) | null = null
  private readonly kickInterval = 1.0

  start(): void {
    if (this.running) return
    this.ctx = new AudioContext()
    this.running = true
    this.startAmbient()
    this.startKickTimer()
  }

  private startAmbient(): void {
    if (!this.ctx) return
    const ctx = this.ctx

    this.ambientGain = ctx.createGain()
    this.ambientGain.gain.value = 0.04

    this.ambientOsc = ctx.createOscillator()
    this.ambientOsc.type = 'sine'
    this.ambientOsc.frequency.value = 55

    this.ambientOsc.connect(this.ambientGain)
    this.ambientGain.connect(ctx.destination)
    this.ambientOsc.start()
  }

  private startKickTimer(): void {
    if (!this.running) return
    this.kickTimeoutId = setTimeout(() => {
      if (this.onKick && this.running) this.onKick()
      this.startKickTimer()
    }, this.kickInterval * 1000)
  }

  playSteamBurst(): void {
    if (!this.ctx) return
    const ctx = this.ctx

    const buffer = this.createNoiseBuffer()
    const source = ctx.createBufferSource()
    source.buffer = buffer

    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 1200
    filter.Q.value = 1

    const gain = ctx.createGain()
    const now = ctx.currentTime
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.3, now + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4)

    source.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    source.start(now)
    source.stop(now + 0.4)
  }

  playGearClick(): void {
    if (!this.ctx) return
    const ctx = this.ctx

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = 180

    const now = ctx.currentTime
    gain.gain.setValueAtTime(0.2, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.08)
  }

  playHorrorSting(): void {
    if (!this.ctx) return
    const ctx = this.ctx

    const osc = ctx.createOscillator()
    osc.type = 'sawtooth'

    const gain = ctx.createGain()
    const now = ctx.currentTime
    osc.frequency.setValueAtTime(440, now)
    osc.frequency.exponentialRampToValueAtTime(55, now + 1.5)

    gain.gain.setValueAtTime(0.1, now)
    gain.gain.linearRampToValueAtTime(0, now + 1.5)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 1.5)
  }

  playHackStart(): void {
    if (!this.ctx) return
    const ctx = this.ctx
    const freqs = [220, 330, 440, 660]
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq

      const t = ctx.currentTime + i * 0.1
      gain.gain.setValueAtTime(0.15, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(t)
      osc.stop(t + 0.08)
    })
  }

  playHackComplete(): void {
    if (!this.ctx) return
    const ctx = this.ctx

    const osc = ctx.createOscillator()
    osc.type = 'sine'

    const gain = ctx.createGain()
    const now = ctx.currentTime
    osc.frequency.setValueAtTime(220, now)
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.3)

    gain.gain.setValueAtTime(0.2, now)
    gain.gain.linearRampToValueAtTime(0, now + 0.3)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.3)
  }

  setHorrorIntensity(_level: number): void {
    // No-op: intensity variation removed for performance
  }

  stop(): void {
    this.running = false
    if (this.kickTimeoutId !== null) {
      clearTimeout(this.kickTimeoutId)
      this.kickTimeoutId = null
    }
    if (this.ambientOsc) {
      try { this.ambientOsc.stop() } catch { /* already stopped */ }
      this.ambientOsc = null
    }
    if (this.ctx) {
      this.ctx.close()
      this.ctx = null
    }
  }

  private createNoiseBuffer(): AudioBuffer {
    const ctx = this.ctx!
    const buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
    return buffer
  }
}
