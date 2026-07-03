package com.reportlop.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "tabel_manual")
public class TabelManual {

    @Id
    @Column(name = "id")
    private String id;

    @Column(name = "lop")
    private String lop;

    @Column(name = "cham")
    private String cham;

    @Column(name = "region")
    private String region;

    @Column(name = "branch")
    private String branch;

    // --- GETTER & SETTER ---

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getLop() { return lop; }
    public void setLop(String lop) { this.lop = lop; }

    public String getCham() { return cham; }
    public void setCham(String cham) { this.cham = cham; }

    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }

    public String getBranch() { return branch; }
    public void setBranch(String branch) { this.branch = branch; }
}