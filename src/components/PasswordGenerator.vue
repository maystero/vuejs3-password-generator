<template>
  <div class="container">
    <div class="password-generator">
      <form @submit.prevent="generatePassword">
        <div class="input-group mb-3">
          <input
            type="text"
            class="form-control password"
            v-model="password"
            readonly
          />
          <div class="input-group-append"></div>
        </div>
        <div class="form-group">
          <div class="button-group">
            <div class="input-group">
              <button
                type="button"
                class="btn btn-outline-secondary"
                @click="decreaseLength"
              >
                <IconMinus :color="'#fff'" />
              </button>
              <div class="length-display mx-2">{{ length }}</div>
              <button
                type="button"
                class="btn btn-outline-secondary"
                @click="increaseLength"
              >
                <IconPlus :color="'#fff'" />
              </button>
            </div>

            <div class="input-group">
              <button
                type="button"
                class="btn btn-outline-secondary"
                @click="copyPassword"
              >
                <IconCopy :color="'#fff'" />
              </button>
              <button
                type="button"
                class="btn btn-outline-secondary"
                @click="generatePassword"
              >
                <IconRandom :color="'#fff'" />
              </button>
            </div>
          </div>
          <input
            type="range"
            v-model="length"
            min="8"
            max="32"
            class="form-control-range mt-2"
            @input="updateSelect"
          />
        </div>
        <div class="form-group">
          <div class="form-check">
            <input
              type="checkbox"
              class="form-check-input"
              v-model="options.uppercase"
              id="uppercase"
              @change="generatePassword"
            />
            <label class="form-check-label" for="uppercase">A-Z</label>
          </div>
          <div class="form-check">
            <input
              type="checkbox"
              class="form-check-input"
              v-model="options.lowercase"
              id="lowercase"
              @change="generatePassword"
            />
            <label class="form-check-label" for="lowercase">a-z</label>
          </div>
          <div class="form-check">
            <input
              type="checkbox"
              class="form-check-input"
              v-model="options.numbers"
              id="numbers"
              @change="generatePassword"
            />
            <label class="form-check-label" for="numbers">0-9</label>
          </div>
          <div class="form-check">
            <input
              type="checkbox"
              class="form-check-input"
              v-model="options.symbols"
              id="symbols"
              @change="generatePassword"
            />
            <label class="form-check-label" for="symbols">@#$</label>
          </div>
        </div>
      </form>
      <div class="info">
        <p>
          Mögliche Kombis: <strong>{{ combinations }}</strong>
        </p>
        <p>
          Geschätzte Knackzeit: <strong>{{ crackTime }}</strong>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import IconPlus from "@/components/icons/IconPlus.vue";
import IconMinus from "@/components/icons/IconMinus.vue";
import IconCopy from "@/components/icons/IconCopy.vue";
import IconRandom from "@/components/icons/IconRandom.vue";

export default {
  components: {
    IconPlus,
    IconMinus,
    IconCopy,
    IconRandom,
  },
  data() {
    return {
      password: "",
      length: 24,
      options: {
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: false,
      },
      combinations: 0,
      crackTime: "",
    };
  },
  mounted() {
    this.generatePassword();
  },
  watch: {
    length() {
      this.generatePassword();
    },
    options: {
      handler() {
        this.generatePassword();
      },
      deep: true,
    },
  },
  methods: {
    increaseLength() {
      if (this.length < 32) {
        this.length++;
      }
    },
    decreaseLength() {
      if (this.length > 8) {
        this.length--;
      }
    },
    getRandomInt(max) {
      // crypto-safe uniform int in [0, max)
      const arr = new Uint32Array(1);
      const limit = Math.floor(0x100000000 / max) * max;
      let x;
      do {
        crypto.getRandomValues(arr);
        x = arr[0];
      } while (x >= limit);
      return x % max;
    },

    shuffle(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = this.getRandomInt(i + 1);
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    },

    generatePassword() {
      const charset = {
        uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        lowercase: "abcdefghijklmnopqrstuvwxyz",
        numbers: "0123456789",
        symbols: "!@#$%^&*()_+[]{}|;:,.<>?",
      };

      const pools = [];
      if (this.options.uppercase) pools.push(charset.uppercase);
      if (this.options.lowercase) pools.push(charset.lowercase);
      if (this.options.numbers) pools.push(charset.numbers);
      if (this.options.symbols) pools.push(charset.symbols);

      if (pools.length === 0) {
        this.password = "";
        this.combinations = 0;
        this.crackTime = "";
        return;
      }

      // 1) zapewnij min 1 znak z każdej wybranej grupy
      const chars = [];
      for (const pool of pools) {
        chars.push(pool[this.getRandomInt(pool.length)]);
      }

      // 2) resztę dobierz z połączonego zbioru
      const all = pools.join("");
      while (chars.length < this.length) {
        chars.push(all[this.getRandomInt(all.length)]);
      }

      // 3) przetasuj, żeby “gwarantowane znaki” nie były zawsze na początku
      this.shuffle(chars);

      this.password = chars.join("");
      this.calculateStats(all.length); // patrz niżej
    },

    calculateStats(actualCharsetSize) {
      // unikaj Infinity: pokazuj entropię w bitach
      const bits = this.length * Math.log2(actualCharsetSize);
      this.combinations = `≈ 2^${bits.toFixed(1)}`;
      this.crackTime = this.estimateCrackTimeFromBits(bits);
    },

    estimateCrackTimeFromBits(bits) {
      // uproszczony model: 1e9 prób/s
      const attemptsPerSecond = 1e9;
      const seconds = Math.pow(2, bits) / attemptsPerSecond;

      // formatowanie jak wcześniej
      const minutes = seconds / 60;
      const hours = minutes / 60;
      const days = hours / 24;
      const years = days / 365;

      if (!isFinite(years) || years > 1e12) return "Praktisch nicht zu knacken";
      if (years > 1e9) return `${(years / 1e9).toFixed(2)} mld lat`;
      if (years > 1e6) return `${(years / 1e6).toFixed(2)} mln lat`;
      if (years > 1) return `${Math.round(years)} lat`;
      if (days > 1) return `${Math.round(days)} dni`;
      if (hours > 1) return `${Math.round(hours)} h`;
      if (minutes > 1) return `${Math.round(minutes)} min`;
      return `${Math.round(seconds)} s`;
    },

    // copyPassword() — lepiej bez alert, ale zostawiam jako uwaga
  },
};
</script>

<style scoped>
.container {
  max-width: 500px;
  min-width: 250px;
  margin: 1em auto; /* auto = wyśrodkowanie poziome */
  padding: 0 1rem;
}

.password-generator {
  font-family: Verdana, Geneva, Tahoma, sans-serif;
  max-width: 500px;
}
.button-group {
  width: 100%;
  display: flex;
  justify-content: space-between;
}
.input-group {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.input-group input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
}

.input-group .input-group-append {
  display: flex;
}

.input-group .btn {
  padding: 0.5rem 0.75rem;
  margin-left: -1px;
  border: 1px solid #f075ac;
  background-color: #ed1375;
  border-radius: 0.25rem;
}

.input-group .btn:hover {
  background-color: #d4d4d4;
}
.btn-outline-secondary {
  color: #6c757d;
  background-color: transparent;
  background-image: none;
  border-color: #6c757d;
  margin-right: 5px;
  margin-left: 5px;
  min-width: 50px;
  display: flex; /* Dodane */
  align-items: center; /* Dodane */
  justify-content: center; /* Dodane, opcjonalnie */
}

.password {
  min-width: 300px;
  margin-right: 5px;
}
.btn-outline-secondary:hover {
  color: #fff;
  background-color: #6c757d;
  border-color: #6c757d;
}
.form-group {
  margin-bottom: 1rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.form-check {
  position: relative;
  display: flex;
  align-items: center;
  padding-left: 1.25rem;
  margin-right: 1rem;
}

.form-check-input {
  position: absolute;
  margin-top: 0.3rem;
  margin-left: -1.25rem;
}

.form-check-label {
  margin-bottom: 0;
}

.length-display {
  display: inline-block;
  width: 3rem;
  text-align: center;
  font-size: 1.3rem;
  font-weight: 600;
  color: #ed1375;
}

.form-control-range {
  width: 100%;
  height: 1.4rem;
  background-color: transparent;
  -webkit-appearance: none;
  appearance: none;
}

.form-control-range::-webkit-slider-runnable-track {
  width: 100%;
  height: 0.5rem;
  cursor: pointer;
  background: #e9ecef;
  border-radius: 0.25rem;
  border: 1px solid #ced4da;
}

.form-control-range::-webkit-slider-thumb {
  height: 1rem;
  width: 1rem;
  border-radius: 50%;
  background: #ed1375;
  cursor: pointer;
  -webkit-appearance: none;
  margin-top: -0.25rem; /* Adjust thumb position */
}

.form-control-range::-moz-range-track {
  width: 100%;
  height: 0.5rem;
  cursor: pointer;
  background: #e9ecef;
  border-radius: 0.25rem;
  border: 1px solid #ced4da;
}

.form-control-range::-moz-range-thumb {
  height: 1rem;
  width: 1rem;
  border-radius: 50%;
  background: #ed1375;
  cursor: pointer;
}

.form-control-range::-ms-track {
  width: 100%;
  height: 0.5rem;
  cursor: pointer;
  background: transparent;
  border-color: transparent;
  color: transparent;
}
</style>
