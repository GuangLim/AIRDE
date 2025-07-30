<template>
  <div>
    <h1 align="center">Regulatory Documents</h1>

    <!-- Controls -->
    <div class="flex flex-wrap gap-4 mb-6 items-center" align="center">
      <!-- Data fetch limit -->
      <label for="fetchLimit" class="text-gray-200">Number of result need to show:</label>
      <input
        v-model.number="fetchLimit"
        type="number"
        min="1"
        max="100"
        class="px-3 py-2 rounded bg-gray-800 text-gray-200 border border-gray-700 w-32"
        placeholder="Fetch count"
      />
      <button
        @click="fetchDocuments"
        class="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5"
      >
        Generate
      </button>
      <br><br>

    <button @click="generateSummary" :disabled="isLoading" type="button"
      class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-6 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
      {{ isLoading ? 'Generating Summary...' : 'Generate Summary' }}
    </button>
    <br>

    <div v-if="summary" style="margin-top: 1em; border: 1px solid #ccc; padding: 1em;">
      <h3>Summary</h3>
      <p>{{ summary }}</p>
      <br>
    </div>
    <br>

    <!-- Country filter -->
      
    </div>

    <div class="relative overflow-x-auto mt-4">
      <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400" align="center">
        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" class="px-6 py-3">Title</th>
            <th scope="col" class="px-6 py-3">Date</th>
            <th scope="col" class="px-6 py-3">
              <select v-model="filterCountry" class="px-3 py-2 rounded bg-gray-800 text-gray-200 border border-gray-700">
                <option value="">All Countries</option>
                <option v-for="country in countryOptions" :key="country" :value="country">
                    {{ country }}
                </option>
              </select>
            </th>
            <th scope="col" class="px-6 py-3">Result</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(doc, index) in paginatedDocuments" :key="index" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
            <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
              {{ doc.companynumb || doc.safetyreportid || 'N/A' }}
            </th>
            <td class="px-6 py-4">
              {{ doc.receivedate || doc.transmissiondate || 'N/A' }}
            </td>
            <td class="px-6 py-4">
              {{ doc.primarysource?.reportercountry || 'N/A' }}
            </td>
            <td class="px-6 py-4">
              <pre>{{ formatDoc(doc) }}</pre>
            </td>
          </tr>
        </tbody>
      </table>
      <br>

      <!-- Pagination Controls -->
      <div class="flex justify-center items-center mt-4 gap-2" align="center">
        <button
          class="px-3 py-1 rounded bg-blue-700 text-white disabled:opacity-50"
          @click="prevPage"
          :disabled="currentPage === 1"
        >
          Prev
        </button>
        <span class="text-gray-300">Page {{ currentPage }} of {{ totalPages }}</span>
        <button
          class="px-3 py-1 rounded bg-blue-700 text-white disabled:opacity-50"
          @click="nextPage"
          :disabled="currentPage === totalPages"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const documents = ref([])
const summary = ref('')
const isLoading = ref(false)
const currentPage = ref(1)
const pageSize = 5

const fetchLimit = ref(10) // Default fetch count
const filterCountry = ref('')
const countryOptions = ref([])

// Fetch data from FDA API
async function fetchDocuments() {
  if (fetchLimit.value < 1 || fetchLimit.value > 100) {
    alert('Please input a valid number between 1 and 100');
    return;
  }
  try {
    const response = await axios.get(`https://api.fda.gov/drug/event.json?limit=${fetchLimit.value}`)
    documents.value = response.data.results

    // Extract unique countries for filter dropdown
    const countries = new Set()
    documents.value.forEach(doc => {
      if (doc.primarysource?.reportercountry) {
        countries.add(doc.primarysource.reportercountry)
      }
    })
    countryOptions.value = Array.from(countries).sort()
    currentPage.value = 1 // Reset to first page after fetch
  } catch (error) {
    console.error('Failed to fetch data:', error)
  }
}

// Initial fetch
onMounted(fetchDocuments)

// Filter logic
const filteredDocuments = computed(() => {
  if (!filterCountry.value) return documents.value
  return documents.value.filter(doc =>
    doc.primarysource?.reportercountry === filterCountry.value
  )
})

// Pagination logic
const totalPages = computed(() => Math.ceil(filteredDocuments.value.length / pageSize))
const paginatedDocuments = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredDocuments.value.slice(start, start + pageSize)
})

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

// Format each document result into plain text
function formatDoc(doc) {
  return `
safetyreportid: ${doc.safetyreportid} , transmissiondate: ${doc.transmissiondate} , receivedate: ${doc.receivedate} ,receiptdate: ${doc.receiptdate}
serious: ${doc.serious} , seriousnessdeath: ${doc.seriousnessdeath} , fulfillexpeditecriteria: ${doc.fulfillexpeditecriteria} , companynumb: ${doc.companynumb} 
reporter_country: ${doc.primarysource?.reportercountry} , qualification: ${doc.primarysource?.qualification} , reactions: ${doc.reaction?.map(r => r.reactionmeddrapt).join(', ')} , drugs: ${doc.patient?.drug?.map(d => d.medicinalproduct).join(', ')}
`.trim()
}

// Combine all documents into one text and send for summary
async function generateSummary() {
  isLoading.value = true
  summary.value = ''

  const combinedText = documents.value.map(formatDoc).join('\n\n')

  try {
    const response = await axios.post(import.meta.env.VITE_SUMMARY_API, {
      text: combinedText
    })
    summary.value = response.data.summary
  } catch (error) {
    console.error('Error generating summary:', error)
    summary.value = 'Failed to generate summary.'
  } finally {
    isLoading.value = false
  }
}
</script>
