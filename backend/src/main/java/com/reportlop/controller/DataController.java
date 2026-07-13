package com.reportlop.controller;

import com.reportlop.model.TabelManual;
import com.reportlop.model.ViewHorasStatus;
import com.reportlop.repository.HorasRepository;
import com.reportlop.repository.ManualRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;
import java.util.ArrayList;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // Mencegah error CORS saat diakses oleh React JS
public class DataController {

    @Autowired
    private ManualRepository manualRepository;

    @Autowired
    private HorasRepository horasRepository;

    // 1. Endpoint GET untuk Tabel Manual (Pagination & Search & Filter)
    @GetMapping("/manual")
    public Page<TabelManual> getManualData(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "") String region,
            @RequestParam(defaultValue = "") String branch) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("lop").ascending());
        return manualRepository.findWithFilters(search, region, branch, pageable);
    }

    // 2. Endpoint GET untuk Tabel Horas (Pagination & Search & Filter)
    @GetMapping("/horas")
    public Page<ViewHorasStatus> getHorasData(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "") String regional,
            @RequestParam(defaultValue = "") String branch,
            @RequestParam(defaultValue = "") String status) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("namaLop").ascending());
        return horasRepository.findWithFilters(search, regional, branch, status, pageable);
    }

    // 3. Endpoint POST untuk Action Sinkronisasi
    @PostMapping("/sync-horas")
    public ResponseEntity<?> syncToManual(@RequestBody TabelManual dataBaru) {
        try {
            // Cek keamanan agar tidak terjadi error duplikat ID
            if (manualRepository.existsById(dataBaru.getId())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Data sudah ada di tabel manual"));
            }
            
            // Menyimpan data yang diklik dari Horas ke tabel_manual
            manualRepository.save(dataBaru);
            return ResponseEntity.ok(Map.of("message", "Berhasil dimasukkan ke Tabel Manual"));
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // 4. Endpoint POST untuk Bulk Sinkronisasi
    @PostMapping("/sync-horas-bulk")
    public ResponseEntity<?> syncToManualBulk(@RequestBody List<TabelManual> dataList) {
        try {
            List<TabelManual> toSave = new ArrayList<>();
            for (TabelManual data : dataList) {
                // Hanya tambahkan jika belum ada di database
                if (!manualRepository.existsById(data.getId())) {
                    toSave.add(data);
                }
            }
            
            if (!toSave.isEmpty()) {
                manualRepository.saveAll(toSave);
            }
            
            return ResponseEntity.ok(Map.of("message", "Berhasil memasukkan " + toSave.size() + " data ke Tabel Manual"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // 5. Endpoint POST untuk Membuat Data Baru di Tabel Manual
    @PostMapping("/manual")
    public ResponseEntity<?> createManualData(@RequestBody TabelManual dataBaru) {
        try {
            if (dataBaru.getId() == null || dataBaru.getId().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "ID tidak boleh kosong"));
            }
            if (manualRepository.existsById(dataBaru.getId())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Data dengan ID tersebut sudah ada"));
            }
            manualRepository.save(dataBaru);
            return ResponseEntity.ok(Map.of("message", "Data berhasil ditambahkan"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // 6. Endpoint PUT untuk Memperbarui Data di Tabel Manual
    @PutMapping("/manual/{id}")
    public ResponseEntity<?> updateManualData(@PathVariable String id, @RequestBody TabelManual dataUpdate) {
        try {
            if (!manualRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            // Pastikan ID di entitas diset dengan benar (menghindari pergantian ID tanpa sengaja)
            dataUpdate.setId(id);
            manualRepository.save(dataUpdate);
            return ResponseEntity.ok(Map.of("message", "Data berhasil diperbarui"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // 7. Endpoint DELETE untuk Menghapus Data dari Tabel Manual
    @DeleteMapping("/manual")
    public ResponseEntity<?> deleteManualData(@RequestParam String id) {
        try {
            if (!manualRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            manualRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Berhasil menghapus data dari Tabel Manual"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // 8. Endpoints untuk Filter Dinamis (Dropdown)
    @GetMapping("/horas/regions")
    public ResponseEntity<List<String>> getHorasRegions() {
        try {
            return ResponseEntity.ok(horasRepository.findDistinctRegional());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/horas/branches")
    public ResponseEntity<List<String>> getHorasBranches(@RequestParam(required = false) String region) {
        try {
            if (region == null || region.trim().isEmpty()) {
                return ResponseEntity.ok(horasRepository.findAllDistinctBranch());
            }
            return ResponseEntity.ok(horasRepository.findDistinctBranchByRegional(region));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/manual/regions")
    public ResponseEntity<List<String>> getManualRegions() {
        try {
            return ResponseEntity.ok(manualRepository.findDistinctRegion());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/manual/branches")
    public ResponseEntity<List<String>> getManualBranches(@RequestParam(required = false) String region) {
        try {
            if (region == null || region.trim().isEmpty()) {
                return ResponseEntity.ok(manualRepository.findAllDistinctBranch());
            }
            return ResponseEntity.ok(manualRepository.findDistinctBranchByRegion(region));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // 9. Endpoint GET untuk Export CSV Tabel Manual
    @GetMapping(value = "/manual/export", produces = "text/csv")
    public ResponseEntity<String> exportManualData(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "") String region,
            @RequestParam(defaultValue = "") String branch) {
        
        List<TabelManual> dataList = manualRepository.findAllWithFiltersUnpaginated(search, region, branch);
        
        StringBuilder csv = new StringBuilder();
        // CSV Header
        csv.append("ID,LoP,Region,Branch,ChAM\n");
        
        // CSV Rows
        for (TabelManual data : dataList) {
            csv.append("\"").append(data.getId() != null ? data.getId().replace("\"", "\"\"") : "").append("\",")
               .append("\"").append(data.getLop() != null ? data.getLop().replace("\"", "\"\"") : "").append("\",")
               .append("\"").append(data.getRegion() != null ? data.getRegion().replace("\"", "\"\"") : "").append("\",")
               .append("\"").append(data.getBranch() != null ? data.getBranch().replace("\"", "\"\"") : "").append("\",")
               .append("\"").append(data.getCham() != null ? data.getCham().replace("\"", "\"\"") : "").append("\"\n");
        }
        
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=\"data_manual.csv\"");
        
        return new ResponseEntity<>(csv.toString(), headers, org.springframework.http.HttpStatus.OK);
    }

    // 7. Endpoint GET untuk Statistik Dashboard Analytics
    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats() {
        try {
            // hitung total manual sebagai 'Tersinkronisasi'
            long totalManual = manualRepository.count();
            
            // hitung total Horas yang belum tersinkronisasi murni dari view status
            long unsynced = horasRepository.findAll().stream()
                .filter(h -> "tidak ada".equalsIgnoreCase(h.getStatus()))
                .count();
                
            long totalData = totalManual + unsynced;
            double percentage = totalData > 0 ? ((double) totalManual / totalData) * 100 : 0;
            
            return ResponseEntity.ok(Map.of(
                "totalData", totalData,
                "totalSynced", totalManual,
                "totalUnsynced", unsynced,
                "syncPercentage", percentage
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}