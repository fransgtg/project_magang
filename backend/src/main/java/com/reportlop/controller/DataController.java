package com.reportlop.controller; // Sesuaikan dengan nama package kamu

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
@CrossOrigin(origins = "*") // Sangat penting! Mencegah error CORS saat diakses oleh React JS
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

    // 5. Endpoint DELETE untuk Menghapus Data dari Tabel Manual
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

    // 6. Endpoint GET untuk Export CSV Tabel Manual
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
}