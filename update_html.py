import os

def update_html(filepath, is_ms=False):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Remove Goal tabs
    if is_ms:
        goal_section = '''                <!-- Langkah 1: Matlamat -->
                <span class="calc-step-label">Langkah 1 — Apakah yang anda lindungi?</span>
                <div class="goal-tabs" role="tablist" aria-label="Matlamat Perlindungan">
                    <button class="goal-tab" data-goal="education" role="tab" aria-selected="false">
                        <span class="tab-icon">🎓</span> Pendidikan Anak
                    </button>
                    <button class="goal-tab" data-goal="parents" role="tab" aria-selected="false">
                        <span class="tab-icon">👨‍👩‍👧</span> Sokongan Ibu Bapa
                    </button>
                    <button class="goal-tab active" data-goal="family" role="tab" aria-selected="true">
                        <span class="tab-icon">👨‍👩‍👧‍👦</span> Keluarga
                    </button>
                </div>

                <!-- Langkah 2: Tempoh -->
                <span class="calc-step-label">Langkah 2 — Berapa tahun untuk mencapai matlamat ini?</span>'''
        new_goal_section = '''                <!-- Langkah 1: Tempoh -->
                <span class="calc-step-label">Langkah 1 — Berapa tahun untuk mencapai matlamat ini?</span>'''
        
        step3_str = '''<!-- Langkah 3: Input Kewangan -->
                <span class="calc-step-label">Langkah 3 — Gambaran kewangan bulanan anda</span>'''
        new_step3_str = '''<!-- Langkah 2: Input Kewangan -->
                <span class="calc-step-label">Langkah 2 — Gambaran kewangan bulanan anda</span>'''
                
        gender_html = '''                    <!-- Gender -->
                    <div class="calc-field">
                        <label>Jantina</label>
                        <div class="gender-toggles" style="display: flex; gap: 10px;">
                            <label class="gender-card" style="flex: 1; text-align: center; border: 2px solid var(--border-color); border-radius: 12px; padding: 12px; cursor: pointer; transition: all 0.2s;">
                                <input type="radio" name="calc_gender" value="Lelaki" style="display: none;">
                                <span style="font-weight: 500; color: var(--text-dark);">👨 Lelaki</span>
                            </label>
                            <label class="gender-card" style="flex: 1; text-align: center; border: 2px solid var(--border-color); border-radius: 12px; padding: 12px; cursor: pointer; transition: all 0.2s;">
                                <input type="radio" name="calc_gender" value="Perempuan" style="display: none;">
                                <span style="font-weight: 500; color: var(--text-dark);">👩 Perempuan</span>
                            </label>
                        </div>
                    </div>
'''
    else:
        goal_section = '''                <!-- Step 1: Goal -->
                <span class="calc-step-label">Step 1 — What are you protecting for?</span>
                <div class="goal-tabs" role="tablist" aria-label="Protection Goals">
                    <button class="goal-tab" data-goal="education" role="tab" aria-selected="false" id="tab-education">
                        <span class="tab-icon">🎓</span> Kids Education
                    </button>
                    <button class="goal-tab" data-goal="parents" role="tab" aria-selected="false" id="tab-parents">
                        <span class="tab-icon">👨‍👩‍👧</span> Supporting Parents
                    </button>
                    <button class="goal-tab active" data-goal="family" role="tab" aria-selected="true" id="tab-family">
                        <span class="tab-icon">👨‍👩‍👧‍👦</span> Family
                    </button>
                </div>

                <!-- Step 2: Years -->
                <span class="calc-step-label">Step 2 — How many years to achieve this goal?</span>'''
        new_goal_section = '''                <!-- Step 1: Years -->
                <span class="calc-step-label">Step 1 — How many years to achieve this goal?</span>'''
                
        step3_str = '''<!-- Step 3: Financial Inputs -->
                <span class="calc-step-label">Step 3 — Your monthly financial picture</span>'''
        new_step3_str = '''<!-- Step 2: Financial Inputs -->
                <span class="calc-step-label">Step 2 — Your monthly financial picture</span>'''

        gender_html = '''                    <!-- Gender -->
                    <div class="calc-field">
                        <label>Gender</label>
                        <div class="gender-toggles" style="display: flex; gap: 10px;">
                            <label class="gender-card" style="flex: 1; text-align: center; border: 2px solid var(--border-color); border-radius: 12px; padding: 12px; cursor: pointer; transition: all 0.2s;">
                                <input type="radio" name="calc_gender" value="Male" style="display: none;">
                                <span style="font-weight: 500; color: var(--text-dark);">👨 Male</span>
                            </label>
                            <label class="gender-card" style="flex: 1; text-align: center; border: 2px solid var(--border-color); border-radius: 12px; padding: 12px; cursor: pointer; transition: all 0.2s;">
                                <input type="radio" name="calc_gender" value="Female" style="display: none;">
                                <span style="font-weight: 500; color: var(--text-dark);">👩 Female</span>
                            </label>
                        </div>
                    </div>
'''

    content = content.replace(goal_section, new_goal_section)
    content = content.replace(step3_str, new_step3_str)
    
    # 2. Insert Gender HTML before DOB
    content = content.replace('                    <!-- DOB -->', gender_html + '                    <!-- DOB -->')

    # 3. Remove gate occupation/business
    if is_ms:
        gate_occ = '''                <input type="text" class="gate-input" id="gate-occupation"
                    placeholder="Pekerjaan (cth. Jurutera, Guru)" autocomplete="organization-title" aria-label="Pekerjaan anda">
                <div id="gate-occupation-error" class="gate-error">Sila masukkan pekerjaan anda</div>

                <input type="text" class="gate-input" id="gate-business"
                    placeholder="Sifat Perniagaan (cth. Sektor Swasta, Bekerja Sendiri)" autocomplete="organization" aria-label="Sifat perniagaan anda">
                <div id="gate-business-error" class="gate-error">Sila masukkan sifat perniagaan anda</div>'''
    else:
        gate_occ = '''                <input type="text" class="gate-input" id="gate-occupation"
                    placeholder="Occupation (e.g. Engineer, Teacher)" autocomplete="organization-title" aria-label="Your occupation">
                <div id="gate-occupation-error" class="gate-error">Please enter your occupation</div>

                <input type="text" class="gate-input" id="gate-business"
                    placeholder="Nature of Business (e.g. Private Sector, Self-Employed)" autocomplete="organization" aria-label="Nature of your business">
                <div id="gate-business-error" class="gate-error">Please enter your nature of business</div>'''

    content = content.replace(gate_occ, '')

    # 4. Modify Quotation Modal fields
    if is_ms:
        modal_gender = '''            <!-- Gender -->
            <label class="modal-field-label" style="margin-top: 0;">Jantina</label>
            <div class="radio-group">
                <label class="radio-label">
                    <input type="radio" name="modal_gender" value="Lelaki"> Lelaki
                </label>
                <label class="radio-label">
                    <input type="radio" name="modal_gender" value="Perempuan"> Perempuan
                </label>
            </div>'''
        modal_occ = '''            <!-- Occupation & Nature of Business -->
            <label class="modal-field-label" style="margin-top: 0;">Pekerjaan</label>
            <input type="text" id="modal_occupation" class="gate-input" placeholder="cth. Jurutera, Guru" style="margin-bottom: 15px; width: 100%; border: 1px solid #ddd; border-radius: 8px; padding: 10px;">
            
            <label class="modal-field-label">Sifat Perniagaan</label>
            <input type="text" id="modal_business" class="gate-input" placeholder="cth. Sektor Swasta, Bekerja Sendiri" style="margin-bottom: 15px; width: 100%; border: 1px solid #ddd; border-radius: 8px; padding: 10px;">'''
    else:
        modal_gender = '''            <!-- Gender -->
            <label class="modal-field-label" style="margin-top: 0;">Gender</label>
            <div class="radio-group">
                <label class="radio-label">
                    <input type="radio" name="modal_gender" value="Male"> Male
                </label>
                <label class="radio-label">
                    <input type="radio" name="modal_gender" value="Female"> Female
                </label>
            </div>'''
        modal_occ = '''            <!-- Occupation & Nature of Business -->
            <label class="modal-field-label" style="margin-top: 0;">Occupation</label>
            <input type="text" id="modal_occupation" class="gate-input" placeholder="e.g. Engineer, Teacher" style="margin-bottom: 15px; width: 100%; border: 1px solid #ddd; border-radius: 8px; padding: 10px;">
            
            <label class="modal-field-label">Nature of Business</label>
            <input type="text" id="modal_business" class="gate-input" placeholder="e.g. Technology, Education" style="margin-bottom: 15px; width: 100%; border: 1px solid #ddd; border-radius: 8px; padding: 10px;">'''

    content = content.replace(modal_gender, modal_occ)

    # 5. Append Medical Modal
    if is_ms:
        med_modal = '''
<!-- Medical Card Modal Overlay -->
<div class="quote-modal-overlay" id="medical-modal" role="dialog" aria-modal="true" aria-labelledby="medical-modal-title">
    <div class="quote-modal-card">
        <button class="quote-modal-close" id="medical-modal-close" aria-label="Tutup">&times;</button>
        <h3 id="medical-modal-title" style="color: #D31225; margin-bottom: 10px; font-size: 1.5rem;">Adakah anda mahu Kad Perubatan?</h3>
        <p style="margin-bottom: 20px; font-size: 0.95rem; color: #666;">Kad perubatan menampung kos penghospitalan anda. Beritahu Anna pilihan anda supaya dia boleh menyertakannya dalam sebut harga anda.</p>
        
        <div class="contact-cards">
            <label class="contact-card" id="med-card-yes">
                <input type="radio" name="modal_medical_card" value="Ya" class="hidden-radio">
                <div class="card-content">
                    <strong>✅ Ya, sertakan kad perubatan</strong>
                </div>
            </label>
            <label class="contact-card" id="med-card-no">
                <input type="radio" name="modal_medical_card" value="Tidak" class="hidden-radio">
                <div class="card-content">
                    <strong>❌ Tidak, perlindungan hayat & PK sahaja</strong>
                </div>
            </label>
        </div>

        <div id="medical-options-container" style="display: none; margin-top: 15px; padding: 15px; background: #f9f9f9; border-radius: 12px;">
            <label class="modal-field-label" style="font-size: 0.9rem; margin-top: 0;">Had Tahunan</label>
            <select id="modal_annual_limit" class="calc-input" style="width: 100%; margin-bottom: 15px;">
                <option value="" disabled selected>Pilih Had Tahunan</option>
                <option value="RM 2,000,000">RM 2,000,000</option>
                <option value="RM 5,000,000">RM 5,000,000</option>
                <option value="RM 8,000,000">RM 8,000,000</option>
            </select>
            
            <label class="modal-field-label" style="font-size: 0.9rem;">Deduktibel</label>
            <select id="modal_deductible" class="calc-input" style="width: 100%;">
                <option value="" disabled selected>Pilih Deduktibel</option>
                <option value="RM 500">RM 500</option>
                <option value="RM 1,000">RM 1,000</option>
                <option value="RM 5,000">RM 5,000</option>
                <option value="RM 10,000">RM 10,000</option>
            </select>
        </div>
        
        <button class="btn btn-primary btn-block" id="medical-submit-btn" disabled
            style="font-size: 1rem; padding: 16px 24px; border-radius: 14px; opacity: 0.5; cursor: not-allowed; margin-top: 20px; width: 100%;">
            Sahkan Pilihan
        </button>
    </div>
</div>
'''
    else:
        med_modal = '''
<!-- Medical Card Modal Overlay -->
<div class="quote-modal-overlay" id="medical-modal" role="dialog" aria-modal="true" aria-labelledby="medical-modal-title">
    <div class="quote-modal-card">
        <button class="quote-modal-close" id="medical-modal-close" aria-label="Close modal">&times;</button>
        <h3 id="medical-modal-title" style="color: #D31225; margin-bottom: 10px; font-size: 1.5rem;">Would you like a Medical Card?</h3>
        <p style="margin-bottom: 20px; font-size: 0.95rem; color: #666;">A medical card covers your hospitalisation costs. Let Anna know your preference so she can include it in your quote.</p>
        
        <div class="contact-cards">
            <label class="contact-card" id="med-card-yes">
                <input type="radio" name="modal_medical_card" value="Yes" class="hidden-radio">
                <div class="card-content">
                    <strong>✅ Yes, include a medical card</strong>
                </div>
            </label>
            <label class="contact-card" id="med-card-no">
                <input type="radio" name="modal_medical_card" value="No" class="hidden-radio">
                <div class="card-content">
                    <strong>❌ No, life & CI cover only</strong>
                </div>
            </label>
        </div>

        <div id="medical-options-container" style="display: none; margin-top: 15px; padding: 15px; background: #f9f9f9; border-radius: 12px;">
            <label class="modal-field-label" style="font-size: 0.9rem; margin-top: 0;">Annual Limit</label>
            <select id="modal_annual_limit" class="calc-input" style="width: 100%; margin-bottom: 15px;">
                <option value="" disabled selected>Select Annual Limit</option>
                <option value="RM 2,000,000">RM 2,000,000</option>
                <option value="RM 5,000,000">RM 5,000,000</option>
                <option value="RM 8,000,000">RM 8,000,000</option>
            </select>
            
            <label class="modal-field-label" style="font-size: 0.9rem;">Deductible</label>
            <select id="modal_deductible" class="calc-input" style="width: 100%;">
                <option value="" disabled selected>Select Deductible</option>
                <option value="RM 500">RM 500</option>
                <option value="RM 1,000">RM 1,000</option>
                <option value="RM 5,000">RM 5,000</option>
                <option value="RM 10,000">RM 10,000</option>
            </select>
        </div>
        
        <button class="btn btn-primary btn-block" id="medical-submit-btn" disabled
            style="font-size: 1rem; padding: 16px 24px; border-radius: 14px; opacity: 0.5; cursor: not-allowed; margin-top: 20px; width: 100%;">
            Confirm Preference
        </button>
    </div>
</div>
'''

    content = content.replace('</body>', med_modal + '\n</body>')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

update_html(r'c:\Users\User\Desktop\ANTIGRAVITY\insurance-landing-page\calculator.html', False)
update_html(r'c:\Users\User\Desktop\ANTIGRAVITY\insurance-landing-page\calculator-ms.html', True)
print('HTML updated!')
