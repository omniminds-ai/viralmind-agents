<script lang="ts">
  import { Shapes, Trophy, Calendar } from 'lucide-svelte';
  import CustomCheckbox from './CustomCheckbox.svelte';

  interface Race {
    id: number;
    name: string;
    actionTokens: number;
    grade: string;
    earnings: number;
    selected: boolean;
    timestamp: string;
    skills: string[];
  }

  export let races: Race[] = [];
  export let onSelectionChanged: (selectedRows: Race[]) => void;

  $: selectedRaces = new Set(races.filter(r => r.selected).map(r => r.id));

  function toggleSelection(race: Race) {
    const updatedRaces = races.map(r => 
      r.id === race.id ? {...r, selected: !r.selected} : r
    );
    onSelectionChanged(updatedRaces.filter(r => r.selected));
  }

  function toggleAll() {
    const allSelected = races.every(r => r.selected);
    const updatedRaces = races.map(r => ({...r, selected: !allSelected}));
    onSelectionChanged(updatedRaces.filter(r => r.selected));
  }

  function getSkillColor(skill: string): { bg: string; text: string } {
    const colors = [
      { bg: 'bg-blue-500/20', text: 'text-blue-400' },
      { bg: 'bg-purple-500/20', text: 'text-purple-400' },
      { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
      { bg: 'bg-amber-500/20', text: 'text-amber-400' },
      { bg: 'bg-rose-500/20', text: 'text-rose-400' },
      { bg: 'bg-indigo-500/20', text: 'text-indigo-400' },
      { bg: 'bg-pink-500/20', text: 'text-pink-400' },
      { bg: 'bg-orange-500/20', text: 'text-orange-400' },
      { bg: 'bg-cyan-500/20', text: 'text-cyan-400' }
    ];
    
    const hash = skill.split('').reduce((acc, char) => {
      return ((acc << 5) - acc) + char.charCodeAt(0) | 0;
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  }
</script>

<div class="w-full bg-[#0C0C0D] rounded-lg overflow-hidden">
  <div class="overflow-x-auto">
    <table class="w-full">
      <thead class="bg-[#2A0F45] text-white">
        <tr>
          <th class="p-4">
            <CustomCheckbox
              checked={races.every(r => r.selected)}
              onChange={toggleAll}
            />
          </th>
          <th class="p-4 text-left">Title</th>
          <th class="p-4 text-left">Skills</th>
          <th class="p-4 text-left">Tokens</th>
          <th class="p-4 text-left">Grade</th>
          <th class="p-4 text-left">Earnings</th>
          <th class="p-4 text-left">Date</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-800">
        {#each races as race}
          <tr class="hover:bg-gray-900/50">
            <td class="p-4">
              <CustomCheckbox
                checked={race.selected}
                onChange={() => toggleSelection(race)}
              />
            </td>
            <td class="p-4 text-gray-300">{race.name}</td>
            <td class="p-4">
              <div class="flex flex-wrap gap-1">
                {#each race.skills as skill}
                  {@const color = getSkillColor(skill)}
                  <span class="rounded-lg {color.bg} {color.text} px-2 py-0.5 text-xs">
                    {skill}
                  </span>
                {/each}
              </div>
            </td>
            <td class="p-4">
              <div class="flex items-center gap-1 text-gray-300">
                <Shapes class="h-4 w-4 text-stone-400" />
                {race.actionTokens}
              </div>
            </td>
            <td class="p-4">
              <span class="rounded px-2 py-1 {race.grade.startsWith('A') ? 'bg-green-600/20 text-green-400' : 'bg-yellow-600/20 text-yellow-400'}">
                {race.grade}
              </span>
            </td>
            <td class="p-4">
              <div class="flex items-center gap-1 text-gray-300">
                <Trophy class="h-4 w-4 text-stone-400" />
                {race.earnings}
              </div>
            </td>
            <td class="p-4">
              <div class="flex items-center gap-1 text-gray-300">
                <Calendar class="h-4 w-4 text-stone-400" />
                {new Date(race.timestamp).toLocaleDateString()}
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
